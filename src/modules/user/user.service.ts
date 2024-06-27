import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import {
  ClientSession,
  Connection,
  FilterQuery,
  Model,
  PaginateModel,
  PaginateOptions,
  PipelineStage,
  Types,
} from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { SignUpDTO } from '../auth/dto';
import { DateFilter } from 'src/common/enums/user.enum';
import { calculateStartDate } from 'src/common/utils';
import { AccountService } from '../accounts/account.service';
import { IncomeService } from '../incomes/income.service';
import { ChangePassDTO, UpdateProfileDTO } from './dto';
import { ExpenseService } from '../expenses/expense.service';
import { CategoriesService } from '../categories/categories.service';
import { AccountDeletionReasons } from 'src/schemas/account-deletion-reason.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<User>,
    @InjectModel(AccountDeletionReasons.name)
    private accountDeletionReasonsModel: Model<AccountDeletionReasons>,

    private accountService: AccountService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,

    @Inject(forwardRef(() => CategoriesService))
    private categoryService: CategoriesService,

    @InjectConnection() private connection: Connection,
  ) {}

  async updateUserSelectedAccount(
    userId: string,
    accountId: string,
    session?: ClientSession,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { selectedAccount: new Types.ObjectId(accountId) },
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
    else throw new NotFoundException(`User not found`);
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) throw new NotFoundException(`User not found`);
    return user;
  }
  async validateUser(userId: string): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
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
                let: { accountId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$accountId', '$$accountId'] },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  { $limit: 3 },
                  {
                    $lookup: {
                      from: 'categories',
                      let: { categoryId: '$categoryId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$categoryId'],
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
                let: { accountId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$accountId', '$$accountId'] },
                    },
                  },
                  { $sort: { createdAt: -1 } },
                  { $limit: 3 },
                  {
                    $lookup: {
                      from: 'categories',
                      let: { categoryId: '$categoryId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$categoryId'],
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
    const [result] = await this.userModel.aggregate(pipeline).exec();

    return result;
  }

  async getUserIncomeExpenseSummaryChart(
    userId: string,
    accountId: string,
    filter: DateFilter = DateFilter.TODAY,
  ): Promise<User> {
    await this.validateUser(userId);
    await this.accountService.validateAccount(accountId);
    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const startDate = calculateStartDate(filter);
    const now = new Date();

    const pipeline = [
      {
        $match: {
          _id: userObjectId,
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: 'userId',
          as: 'accounts',
        },
      },
      {
        $unwind: '$accounts',
      },
      {
        $match: {
          'accounts._id': accountObjectId,
        },
      },
      {
        $lookup: {
          from: 'incomes',
          let: { accountId: '$accounts._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$accountId', '$$accountId'] },
                    { $eq: ['$userId', userObjectId] },
                    { $gte: ['$createdAt', startDate] },
                    { $lte: ['$createdAt', now] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalIncome: { $sum: '$amount' },
              },
            },
          ],
          as: 'incomeSummary',
        },
      },
      {
        $lookup: {
          from: 'expenses',
          let: { accountId: '$accounts._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$accountId', '$$accountId'] },
                    { $eq: ['$userId', userObjectId] },
                    { $gte: ['$createdAt', startDate] },
                    { $lte: ['$createdAt', now] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalExpense: { $sum: '$amount' },
              },
            },
          ],
          as: 'expenseSummary',
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          'accountId._id': 1,
          'accountId.name': 1,
          totalIncome: { $arrayElemAt: ['$incomeSummary.totalIncome', 0] },
          totalExpense: { $arrayElemAt: ['$expenseSummary.totalExpense', 0] },
        },
      },
      {
        $addFields: {
          totalIncome: { $ifNull: ['$totalIncome', 0] },
          totalExpense: { $ifNull: ['$totalExpense', 0] },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ['$totalIncome', '$totalExpense'] },
        },
      },
    ];

    const [result] = await this.userModel.aggregate(pipeline).exec();

    return result;
  }

  async changePassword(userId: string, dto: ChangePassDTO) {
    const user = await this.userModel.findById(userId);

    const isPassMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isPassMatch) {
      throw new BadRequestException('Your current password is not correct.');
    }
    user.password = dto.newPassword;
    await user.save();

    user.password = undefined;

    return { result: 'Your password has been changed successfully.' };
  }

  async findByIdandUpdate(
    userId: string,
    dto: UpdateProfileDTO,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .exec();

    if (!user) throw new NotFoundException(`User  not found`);
    user.password = undefined;
    return user;
  }
  async deleteUserProfile(
    userId: string,
    reason: string,
  ): Promise<{ message: string }> {
    await this.validateUser(userId);

    const user = await this.findById(userId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const deletionReason = new this.accountDeletionReasonsModel({
        reason,
        email: user.email,
        name: user.name,
      });
      await deletionReason.save({ session });

      await this.incomeService.deleteIncomesByUserId(userId, session);

      await this.expenseService.deleteExpensesByUserId(userId, session);

      await this.categoryService.deleteAllCategoriesByUserId(userId, session);

      await this.accountService.deleteAccountsByUserId(userId, session);
      await this.userModel.findByIdAndDelete(userId, { session }).exec();

      await session.commitTransaction();
      return {
        message: 'User Profile has been deleted',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteUserAccountsData(userId: string): Promise<{ message: string }> {
    await this.validateUser(userId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.incomeService.deleteIncomesByUserId(userId, session);

      await this.expenseService.deleteExpensesByUserId(userId, session);

      await this.categoryService.deleteCategoriesByUserId(userId, session);

      await this.accountService.resetAccountDataByUserId(userId, session);

      await session.commitTransaction();
      return {
        message: 'User data and all linked records deleted successfully',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
