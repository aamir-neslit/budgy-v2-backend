import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategoriesSchema } from 'src/schemas/categories.schema';
import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../user/user.module';
import { UserController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
    ]),
    UserModule,
    AccountModule,
  ],
  controllers: [UserController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
