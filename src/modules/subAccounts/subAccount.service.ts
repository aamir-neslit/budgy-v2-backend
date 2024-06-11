import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubAccount } from '../../Models/subAccount.schema';
import { CreateSubAccountDTO } from './dto';
import { Model } from 'mongoose';

@Injectable()
export class SubAccountService {
  constructor(
    @InjectModel(SubAccount.name) private subAccountModel: Model<SubAccount>,
  ) {}
  async create(dto: CreateSubAccountDTO): Promise<SubAccount> {
    const subAccount = new this.subAccountModel(dto);
    return subAccount.save();
  }
}
