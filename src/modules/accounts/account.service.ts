import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../../schemas/account.schema';
import { CreateAccountDTO } from './dto';
import { ClientSession, Model, Types } from 'mongoose';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}
  async create(
    createAccountDto: CreateAccountDTO,
    session?: ClientSession,
  ): Promise<Account> {
    const account = new this.accountModel(createAccountDto);
    return account.save({ session });
  }

  async findByIdAndUserId(accountId: string): Promise<Account> {
    return this.accountModel.findOne({ _id: accountId }).exec();
  }

  async updateAccountIncome(
    accountId: string,
    amount: number,
    session: ClientSession,
  ): Promise<Account> {
    const updatedAccount = await this.accountModel.findByIdAndUpdate(
      accountId,
      {
        $set: { recentIncome: amount },
        $inc: { totalIncome: amount },
      },
      { new: true, session },
    );

    return updatedAccount;
  }

  async updateAccountExpense(
    accountId: string,
    amount: number,
    session: ClientSession,
  ): Promise<Account> {
    const updatedAccount = await this.accountModel.findByIdAndUpdate(
      accountId,
      {
        $set: { recentExpense: amount },
        $inc: { totalExpense: amount },
      },
      { new: true, session },
    );

    return updatedAccount;
  }

  async validateAccount(accountId: string): Promise<void> {
    const account = await this.findByIdAndUserId(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
  }
  async deleteAccountsByUserId(
    id: string,
    session: ClientSession,
  ): Promise<void> {
    const userId = new Types.ObjectId(id);
    await this.accountModel.deleteMany({ userId }, { session }).exec();
  }

  async resetAccountDataByUserId(
    userId: string,
    session: ClientSession,
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    await this.accountModel
      .updateMany(
        { userId: userObjectId },
        { recentExpense: 0, recentIncome: 0, totalExpense: 0, totalIncome: 0 },
        { session },
      )
      .exec();
  }
}
