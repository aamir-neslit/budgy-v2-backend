import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, PaginateModel } from 'mongoose';
import { Income, IncomeDocument } from 'src/models/income.schema';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { CreateIncomeDTO } from './dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name)
    private incomeModel: PaginateModel<IncomeDocument>,
    private accountService: AccountService,
    private userService: UserService,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(createIncomeDTO: CreateIncomeDTO): Promise<Income> {
    const { accountId, userId, amount } = createIncomeDTO;
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newIncome = new this.incomeModel(createIncomeDTO);
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
  async getIncomes(userId: string, accountId: string): Promise<Income[]> {
    return this.incomeModel
      .find({ userId, accountId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
