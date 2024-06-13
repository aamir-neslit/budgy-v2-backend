import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, PaginateModel } from 'mongoose';
import { Expense } from 'src/Models/expense.schema';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { CreateExpenseDTO } from './dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: PaginateModel<Expense>,
    private accountService: AccountService,
    private userService: UserService,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(createExpenseDTO: CreateExpenseDTO): Promise<Expense> {
    const { accountId, userId, amount } = createExpenseDTO;
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newExpense = new this.expenseModel(createExpenseDTO);
      await newExpense.save({ session });

      await this.accountService.updateAccountExpense(
        accountId,
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
  async getExpense(userId: string, accountId: string): Promise<Expense[]> {
    return this.expenseModel
      .find({ userId, accountId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
