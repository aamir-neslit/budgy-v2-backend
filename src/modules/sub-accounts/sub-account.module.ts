import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubAccount, SubAccountSchema } from '../../Models/sub-account.schema';
import { SubAccountService } from './sub-account.service';
import { SubAccountController } from './sub-account.controller';
import { IncomeModule } from '../incomes/income.module';
import { UserModule } from '../user/user.module';

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
