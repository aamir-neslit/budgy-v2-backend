import { Module } from '@nestjs/common';
import { UserController } from './sub-account.controller';
import { SubAccountService } from './sub-account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubAccount, SubAccountSchema } from '../../Models/sub-account.schema';

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
