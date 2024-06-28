import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, PaginateModel, Types } from 'mongoose';

import { Income, IncomeDocument } from 'src/schemas/income.schema';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { CreateIncomeDTO } from './dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private incomeModel: PaginateModel<IncomeDocument>,
    private accountService: AccountService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @InjectConnection() private connection: Connection,
  ) {}
  async create(createIncomeDTO: CreateIncomeDTO): Promise<any> {
    const { accountId, userId, amount, categoryId } = createIncomeDTO;
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newIncome = new this.incomeModel({
        ...createIncomeDTO,
        userId: new Types.ObjectId(userId),
        accountId: new Types.ObjectId(accountId),
        categoryId: new Types.ObjectId(categoryId),
      });
      await newIncome.save({ session });

      await this.accountService.updateAccountIncome(accountId, amount, session);
      await session.commitTransaction();
      session.endSession();

      const populatedIncome = await this.incomeModel
        .findById(newIncome._id)
        .populate('categoryId', 'type label')
        .exec();

      const response = {
        _id: populatedIncome._id,
        amount: populatedIncome.amount,
        createdAt: populatedIncome.createdAt,
        category: populatedIncome.categoryId,
      };
      return response;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getIncomesBasedOnDuration(
    userId: string,
    accountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Income[]> {
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);

    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const start = new Date(startDate.toISOString().split('T')[0]);
    const end = new Date(endDate.toISOString().split('T')[0]);

    const incomes = await this.incomeModel
      .aggregate([
        {
          $match: {
            userId: userObjectId,
            accountId: accountObjectId,
            createdAt: {
              $gte: start,
              $lt: new Date(end.setDate(end.getDate() + 1)),
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            _id: 1,
            amount: 1,
            createdAt: 1,
            'category._id': 1,
            'category.label': 1,
            'category.type': 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .exec();

    if (!incomes || !incomes.length) {
      throw new NotFoundException(
        'No incomes found for the specified user, account, and date range',
      );
    }

    return incomes;
  }

  async deleteIncomesByUserId(
    id: string,
    session: ClientSession,
  ): Promise<void> {
    const userId = new Types.ObjectId(id);
    await this.incomeModel.deleteMany({ userId }, { session }).exec();
  }
}
