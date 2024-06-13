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
import { User, UserDocument } from '../../Models/user.schema';
import { SignUpDTO } from '../auth/dto';
import { SubAccountService } from '../sub-accounts/sub-account.service';
import { IncomeDocument } from 'src/Models/income.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<User>,
    @InjectModel('Income') private readonly incomeModel: Model<IncomeDocument>,
    private subAccountService: SubAccountService,
  ) {}

  async updateUserFirstSubAccount(
    userId: string,
    subAccountId: string,
    session: ClientSession,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { selectedSubAccount: subAccountId },
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
  async getUserStatistics(userId: string, subAccountId: string): Promise<any> {
    await this.validateUser(userId);
    await this.subAccountService.validateSubAccount(subAccountId);

    const userObjectId = new Types.ObjectId(userId);
    const subAccountObjectId = new Types.ObjectId(subAccountId);

    const pipeline: PipelineStage[] = [
      { $match: { _id: userObjectId } },
      {
        $lookup: {
          from: 'subaccounts',
          localField: '_id',
          foreignField: 'userId',
          as: 'subAccounts',
        },
      },
      { $unwind: '$subAccounts' },
      { $match: { 'subAccounts._id': subAccountObjectId } },
      {
        $lookup: {
          from: 'incomes',
          let: { subAccountId: subAccountId },
          pipeline: [
            { $match: { $expr: { $eq: ['$subAccountId', subAccountId] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            {
              $project: {
                userId: 0,
                subAccountId: 0,
                categoryId: 0,
                updatedAt: 0,
              },
            },
          ],
          as: 'recentIncomes',
        },
      },
      {
        $lookup: {
          from: 'expenses',
          let: { subAccountId: subAccountId },
          pipeline: [
            { $match: { $expr: { $eq: ['$subAccountId', subAccountId] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            {
              $project: {
                userId: 0,
                subAccountId: 0,
                categoryId: 0,
                updatedAt: 0,
              },
            },
          ],
          as: 'recentExpenses',
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          'subAccounts._id': 1,
          'subAccounts.name': 1,
          'subAccounts.balance': 1,
          'subAccounts.totalIncome': 1,
          'subAccounts.totalExpense': 1,
          recentIncomes: 1,
          recentExpenses: 1,
        },
      },
    ];

    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const result = await this.userModel.aggregate(pipeline).exec();
    console.log('Result:', result);

    return result[0] || null;
  }
}
