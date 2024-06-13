import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubAccount, SubAccountSchema } from '../../Models/sub-account.schema';
import { SubAccountController } from './sub-account.controller';
import { SubAccountService } from './sub-account.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubAccount.name, schema: SubAccountSchema },
    ]),
  ],
  controllers: [SubAccountController],
  providers: [SubAccountService],
  exports: [SubAccountService],
})
export class SubAccountModule {}
