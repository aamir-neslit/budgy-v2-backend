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
}
