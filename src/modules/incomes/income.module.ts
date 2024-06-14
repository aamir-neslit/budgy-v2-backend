import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from 'src/models/income.schema';
import { AccountModule } from '../accounts/account.module';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { UserModule } from '../user/user.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    AccountModule,
    UserModule,
    CategoriesModule,
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
