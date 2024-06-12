import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JWTDecodedUserI } from 'src/interfaces';
import { UserDocument } from '../../Models/user.schema';
import { UserService } from '../user/user.service';
import { SignInDTO, SignUpDTO } from './dto';
import { SubAccountService } from '../sub-accounts/sub-account.service';
import { CategoriesService } from '../categories/categories.service';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { CreateSubAccountDTO } from '../sub-accounts/dto';
import { CreateCatgoryDTO } from '../categories/dto';
import {
  defaultCategories,
  defaultSubAccounts,
} from 'src/common/constants/user.constant';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
    private subAccountService: SubAccountService,
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

  // async signup(dto: SignUpDTO): Promise<{ user: UserDocument; token: string }> {
  //   const user = await this.userService.create(dto);
  //   const token = await this.signToken(user._id, user.email);
  //   return { user, token: token.access_token };
  // }
  async signup(dto: SignUpDTO) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userService.create(dto, session);
      const token = await this.signToken(user._id, user.email);

      const subAccountPromises = defaultSubAccounts.map(async (accountName) => {
        const createSubAccountDto: CreateSubAccountDTO = {
          name: accountName,
          userId: user._id,
        };
        const subAccount = await this.subAccountService.create(
          createSubAccountDto,
          session,
        );

        const categoryPromises = defaultCategories.map(async (category) => {
          const createCategoryDto: CreateCatgoryDTO = {
            type: category.type,
            label: category.label,
            subAccountId: subAccount._id,
            userId: user._id,
          };
          return this.categoriesService.create(createCategoryDto, session);
        });

        await Promise.all(categoryPromises);
        return subAccount;
      });

      const createdSubAccounts = await Promise.all(subAccountPromises);
      await this.userService.updateUserFirstSubAccount(
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
