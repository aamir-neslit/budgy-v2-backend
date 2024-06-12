import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Expense } from 'src/Models/expense.schema';
import { CreateExpenseDTO } from './dto';
import { SubAccountService } from '../sub-accounts/sub-account.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private subAccountService: SubAccountService,
    private userService: UserService,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(createExpenseDTO: CreateExpenseDTO): Promise<Expense> {
    const { subAccountId, userId, amount } = createExpenseDTO;
    await this.userService.validateUser(userId);
    await this.subAccountService.validateSubAccount(subAccountId, userId);
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newExpense = new this.expenseModel(createExpenseDTO);
      await newExpense.save({ session });

      await this.subAccountService.updateExpense(
        subAccountId,
        userId,
        amount,
        session,
      );
      await session.commitTransaction();
      session.endSession();
      return newExpense;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  async getExpense(userId: string, subAccountId: string): Promise<Expense[]> {
    return this.expenseModel
      .find({ userId, subAccountId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
