import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../user/user.module';
import { CategoriesModule } from '../categories/categories.module';
import { Expense, ExpenseSchema } from 'src/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    AccountModule,
    UserModule,
    CategoriesModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
