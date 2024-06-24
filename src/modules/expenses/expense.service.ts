import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, PaginateModel, Types } from 'mongoose';

import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { CreateExpenseDTO } from './dto';
import { CategoriesService } from '../categories/categories.service';
import { Expense } from 'src/schemas/expense.schema';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: PaginateModel<Expense>,
    private accountService: AccountService,
    private userService: UserService,
    private categoriesService: CategoriesService,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(createExpenseDTO: CreateExpenseDTO): Promise<Expense> {
    const { accountId, userId, amount, categoryId } = createExpenseDTO;
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);
    await this.categoriesService.validateCategoryId(categoryId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newExpense = new this.expenseModel({
        ...createExpenseDTO,
        userId: new Types.ObjectId(userId),
        accountId: new Types.ObjectId(accountId),
        categoryId: new Types.ObjectId(categoryId),
      });
      await newExpense.save({ session });

      await this.accountService.updateAccountExpense(
        accountId,
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
  async getExpensesBasedOnDuration(
    userId: string,
    accountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);

    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);

    const start = new Date(startDate.toISOString().split('T')[0]);
    const end = new Date(endDate.toISOString().split('T')[0]);

    const expenses = await this.expenseModel
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

    if (!expenses || !expenses.length) {
      throw new NotFoundException(
        'No expense found for the specified user, account, and date range',
      );
    }

    return expenses;
  }
}
