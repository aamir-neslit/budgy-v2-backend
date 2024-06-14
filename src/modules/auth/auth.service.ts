import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectConnection } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Connection } from 'mongoose';
import {
  defaultCategories,
  defaultSubAccounts,
} from 'src/common/constants/user.constant';
import { JWTDecodedUserI } from 'src/interfaces';
import { UserDocument } from '../../models/user.schema';
import { AccountService } from '../accounts/account.service';
import { CreateAccountDTO } from '../accounts/dto';
import { CategoriesService } from '../categories/categories.service';
import { CreateCatgoryDTO } from '../categories/dto';
import { UserService } from '../user/user.service';
import { SignInDTO, SignUpDTO } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
    private accountService: AccountService,
    private categoriesService: CategoriesService,
    @InjectConnection() private connection: Connection,
  ) {}

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const jwtSecret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      secret: jwtSecret,
    });
    return { access_token: token };
  }

  async verifyToken(token: string): Promise<Partial<JWTDecodedUserI>> {
    try {
      const jwtSecret = await this.config.get('JWT_SECRET');
      const decoded = await this.jwt.verify(token, { secret: jwtSecret });

      if (!decoded) {
        throw new UnauthorizedException('Token is invalid or expired');
      }
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token is invalid');
    }
  }

  async signin(dto: SignInDTO): Promise<{ user: UserDocument; token: string }> {
    const user = await this.userService.findByEmail(dto.email);
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Either email or password is invalid');
    }
    const token = await this.signToken(user._id, user.email);
    return { user, token: token.access_token };
  }

  async signup(dto: SignUpDTO) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userService.create(dto, session);
      const token = await this.signToken(user._id, user.email);

      const subAccountPromises = defaultSubAccounts.map(async (accountName) => {
        const createSubAccountDto: CreateAccountDTO = {
          name: accountName,
          userId: user._id,
        };
        const account = await this.accountService.create(
          createSubAccountDto,
          session,
        );

        const categoryPromises = defaultCategories.map(async (category) => {
          const createCategoryDto: CreateCatgoryDTO = {
            type: category.type,
            label: category.label,
            accountId: account._id,
            userId: user._id,
          };
          return this.categoriesService.create(createCategoryDto, session);
        });

        await Promise.all(categoryPromises);
        return account;
      });

      const createdSubAccounts = await Promise.all(subAccountPromises);
      await this.userService.updateUserSelectedAccount(
        user._id,
        createdSubAccounts[0]._id,
        session,
      );

      await session.commitTransaction();
      session.endSession();
      return { user, token };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
