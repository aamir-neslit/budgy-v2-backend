import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SubAccountModule } from '../subAccounts/subAccount.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    JwtModule.register({}),
    UserModule,
    SubAccountModule,
    CategoriesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
