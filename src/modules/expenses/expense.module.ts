import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/Models/expense.schema';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { SubAccountModule } from '../sub-accounts/sub-account.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    SubAccountModule,
    UserModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
