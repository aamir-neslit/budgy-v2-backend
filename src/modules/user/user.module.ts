import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { AccountModule } from '../accounts/account.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { InComeModule } from '../incomes/income.module';
import { IncomeService } from '../incomes/income.service';
import { ExpenseModule } from '../expenses/expense.module';
import { CategoriesModule } from '../categories/categories.module';
import {
  AccountDeletionReasons,
  AccountDeletionReasonsSchema,
} from 'src/schemas/account-deletion-reason.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: AccountDeletionReasons.name,
        schema: AccountDeletionReasonsSchema,
      },
    ]),
    forwardRef(() => InComeModule),
    forwardRef(() => ExpenseModule),
    forwardRef(() => CategoriesModule),
    AccountModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
