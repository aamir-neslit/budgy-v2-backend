import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Models/user.schema';
import { SubAccountModule } from '../sub-accounts/sub-account.module';
import { AuthModule } from '../auth/auth.module';
import { IncomeModule } from '../incomes/income.module';
import { ExpenseModule } from '../expenses/expense.module';
import { Income, IncomeSchema } from 'src/Models/income.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
    SubAccountModule,
    // IncomeModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
