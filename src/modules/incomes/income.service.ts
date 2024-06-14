import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, PaginateModel, Types } from 'mongoose';
import { Income, IncomeDocument } from 'src/models/income.schema';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { CreateIncomeDTO } from './dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private incomeModel: PaginateModel<IncomeDocument>,
    private accountService: AccountService,
    private userService: UserService,
    private categoriesService: CategoriesService,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(createIncomeDTO: CreateIncomeDTO): Promise<Income> {
    const { accountId, userId, amount, categoryId } = createIncomeDTO;
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);
    await this.categoriesService.validateCategoryId(categoryId);

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

      await this.accountService.updateAccountIncome(
        accountId,
        userId,
        amount,
        session,
      );
      await session.commitTransaction();
      session.endSession();
      return newIncome;
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
      ])
      .exec();

    if (!incomes || incomes.length === 0) {
      throw new NotFoundException(
        'No incomes found for the specified user, account, and date range',
      );
    }

    return incomes;
  }
}
