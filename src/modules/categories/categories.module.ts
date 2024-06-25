import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../user/user.module';
import { UserController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Categories, CategoriesSchema } from 'src/schemas/categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
    ]),
    forwardRef(() => UserModule),
    AccountModule,
  ],
  controllers: [UserController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
