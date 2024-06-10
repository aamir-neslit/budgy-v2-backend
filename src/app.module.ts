import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectIdInterceptor, ResultInterceptor } from './common/interceptors';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    UserModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ObjectIdInterceptor,
    },
  ],
})
export class AppModule {}
