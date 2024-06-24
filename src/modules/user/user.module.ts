import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../../schemas/user.schema';
import { AccountModule } from '../accounts/account.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Income, IncomeSchema } from 'src/schemas/income.schema';
import { Expense, ExpenseSchema } from 'src/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Income.name, schema: IncomeSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
    AccountModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
