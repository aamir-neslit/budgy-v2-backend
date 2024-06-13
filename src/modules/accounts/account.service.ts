import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../../models/account.schema';
import { CreateAccountDTO } from './dto';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}
  async create(
    dto: CreateAccountDTO,
    session?: ClientSession,
  ): Promise<Account> {
    const account = new this.accountModel(dto);
    return account.save({ session });
  }

  async findByIdAndUserId(accountId: string): Promise<Account> {
    return this.accountModel.findOne({ _id: accountId }).exec();
  }

  async updateAccountIncome(
    accountId: string,
    userId: string,
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
    userId: string,
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
      throw new Error('Account not found');
    }
  }
}
