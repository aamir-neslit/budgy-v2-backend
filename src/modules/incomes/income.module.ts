import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Income, IncomeSchema } from 'src/schemas/income.schema';
import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../user/user.module';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    forwardRef(() => UserModule),
    AccountModule,
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class InComeModule {}
