import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubAccount } from '../../Models/sub-account.schema';
import { CreateSubAccountDTO } from './dto';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class SubAccountService {
  constructor(
    @InjectModel(SubAccount.name) private subAccountModel: Model<SubAccount>,
  ) {}
  async create(
    dto: CreateSubAccountDTO,
    session?: ClientSession,
  ): Promise<SubAccount> {
    const subAccount = new this.subAccountModel(dto);
    return subAccount.save({ session });
  }

  async findByIdAndUserId(subAccountId: string): Promise<SubAccount> {
    return this.subAccountModel.findOne({ _id: subAccountId }).exec();
  }

  async updateIncome(
    subAccountId: string,
    userId: string,
    amount: number,
    session: ClientSession,
  ): Promise<SubAccount> {
    const updatedSubAccount = await this.subAccountModel.findByIdAndUpdate(
      subAccountId,
      {
        $set: { recentIncome: amount },
        $inc: { totalIncome: amount },
      },
      { new: true, session },
    );

    return updatedSubAccount;
  }

  async updateExpense(
    subAccountId: string,
    userId: string,
    amount: number,
    session: ClientSession,
  ): Promise<SubAccount> {
    const updatedSubAccount = await this.subAccountModel.findByIdAndUpdate(
      subAccountId,
      {
        $set: { recentExpense: amount },
        $inc: { totalExpense: amount },
      },
      { new: true, session },
    );

    return updatedSubAccount;
  }

  async validateSubAccount(subAccountId: string): Promise<void> {
    const subAccount = await this.findByIdAndUserId(subAccountId);
    if (!subAccount) {
      throw new Error('SubAccount not found');
    }
  }
}
