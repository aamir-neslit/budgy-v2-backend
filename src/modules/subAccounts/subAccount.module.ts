import { Module } from '@nestjs/common';
import { UserController } from './subAccount.controller';
import { SubAccountService } from './subAccount.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubAccount, SubAccountSchema } from '../../Models/subAccount.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubAccount.name, schema: SubAccountSchema },
    ]),
  ],
  providers: [SubAccountService],
  exports: [SubAccountService],
})
export class SubAccountModule {}
