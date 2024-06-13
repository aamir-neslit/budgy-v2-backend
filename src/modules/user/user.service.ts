import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  Model,
  PaginateModel,
  PaginateOptions,
  PipelineStage,
  Types,
} from 'mongoose';
import { User, UserDocument } from '../../models/user.schema';
import { SignUpDTO } from '../auth/dto';

import { AccountService } from '../accounts/account.service';
import { DateFilter } from 'src/common/enums/user.enum';
import { calculateBalance, calculateStartDate } from 'src/common/utils';
import { Income } from 'src/models/income.schema';
import { Expense } from 'src/models/expense.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<User>,
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private accountService: AccountService,
  ) {}

  async updateUserSelectedAccount(
    userId: string,
    accountId: string,
    session?: ClientSession,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { selectedAccount: accountId },
        { new: true, session }, // required true so that it will return updated document
      )
      .exec();
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    user.password = undefined;
    return user;
  }

  async create(dto: SignUpDTO, session?: ClientSession): Promise<UserDocument> {
    const userInDB = await this.userModel.findOne({ email: dto.email });
    if (userInDB) {
      throw new ConflictException('User already exists with this email');
    }

    const user = new this.userModel(dto);
    return user.save({ session });
  }

  async find(query: FilterQuery<User>, paginateOptions?: PaginateOptions) {
    return await this.userModel.paginate(query, paginateOptions);
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();

    if (user) return user;
    else throw new NotFoundException(`User with email ${email} not found`);
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }
  async validateUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  }

  async getUserSelectedAccountStatistics(
    userId: string,
    accountId: string,
  ): Promise<User> {
    await this.validateUser(userId);
    await this.accountService.validateAccount(accountId);

    const userObjectId = new Types.ObjectId(userId);
    const subAccountObjectId = new Types.ObjectId(accountId);

    const pipeline: PipelineStage[] = [
      { $match: { _id: userObjectId } },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: 'userId',
          as: 'accounts',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'accounts',
          let: { userId: userObjectId, accountId: subAccountObjectId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$_id', '$$accountId'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'incomes',
                let: { accountIdStr: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$accountId', '$$accountIdStr'] },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  { $limit: 3 },
                  {
                    $lookup: {
                      from: 'categories',
                      let: { categoryIdStr: { $toObjectId: '$categoryId' } },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$categoryIdStr'],
                            },
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            label: 1,
                            type: 1,
                          },
                        },
                      ],
                      as: 'category',
                    },
                  },
                  {
                    $unwind: {
                      path: '$category',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      amount: 1,
                      createdAt: 1,
                      'category.label': 1,
                      'category.type': 1,
                    },
                  },
                ],
                as: 'recentIncomes',
              },
            },
            {
              $lookup: {
                from: 'expenses',
                let: { accountIdStr: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$accountId', '$$accountIdStr'] },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  { $limit: 3 },
                  {
                    $lookup: {
                      from: 'categories',
                      let: { categoryIdStr: { $toObjectId: '$categoryId' } },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$categoryIdStr'],
                            },
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            label: 1,
                            type: 1,
                          },
                        },
                      ],
                      as: 'category',
                    },
                  },
                  {
                    $unwind: {
                      path: '$category',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      amount: 1,
                      createdAt: 1,
                      'category.label': 1,
                      'category.type': 1,
                    },
                  },
                ],
                as: 'recentExpenses',
              },
            },
            {
              $addFields: {
                recentIncomes: '$recentIncomes',
                recentExpenses: '$recentExpenses',
              },
            },
          ],
          as: 'selectedAccountDetails',
        },
      },
      {
        $addFields: {
          selectedAccount: {
            $arrayElemAt: ['$selectedAccountDetails', 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          accounts: 1,
          'selectedAccount._id': 1,
          'selectedAccount.name': 1,
          'selectedAccount.balance': 1,
          'selectedAccount.totalIncome': 1,
          'selectedAccount.totalExpense': 1,
          'selectedAccount.recentIncomes': 1,
          'selectedAccount.recentExpenses': 1,
        },
      },
    ];
    const result = await this.userModel.aggregate(pipeline).exec();

    return result[0] || null;
  }

  async getUserIncomeExpenseSummaryChart(
    userId: string,
    accountId: string,
    filter: DateFilter = DateFilter.TODAY,
  ): Promise<any> {
    await this.validateUser(userId);
    await this.accountService.validateAccount(accountId);

    const startDate = calculateStartDate(filter);
    const now = new Date();

    const incomes = await this.incomeModel
      .aggregate([
        {
          $match: {
            userId: userId,
            accountId: accountId.toString(),
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const expenses = await this.expenseModel
      .aggregate([
        {
          $match: {
            userId: userId,
            accountId: accountId.toString(),
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const totalIncome = incomes.length > 0 ? incomes[0].totalIncome : 0;
    const totalExpense = expenses.length > 0 ? expenses[0].totalExpense : 0;
    const balance = calculateBalance(totalIncome, totalExpense);

    return {
      totalIncome,
      totalExpense,
      balance,
      filter,
    };
  }
}
