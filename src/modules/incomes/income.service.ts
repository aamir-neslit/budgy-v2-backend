import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { Income, IncomeDocument } from 'src/Models/income.schema';
import { SubAccountService } from '../sub-accounts/sub-account.service';
import { CreateIncomeDTO } from './dto';
import { UserService } from '../user/user.service';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<IncomeDocument>,
    private subAccountService: SubAccountService,
    private userService: UserService,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(createIncomeDTO: CreateIncomeDTO): Promise<Income> {
    const { subAccountId, userId, amount } = createIncomeDTO;
    await this.userService.validateUser(userId);
    await this.subAccountService.validateSubAccount(subAccountId, userId);
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newIncome = new this.incomeModel(createIncomeDTO);
      await newIncome.save({ session });

      await this.subAccountService.updateIncome(
        subAccountId,
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
  async getIncomes(userId: string, subAccountId: string): Promise<Income[]> {
    return this.incomeModel
      .find({ userId, subAccountId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
