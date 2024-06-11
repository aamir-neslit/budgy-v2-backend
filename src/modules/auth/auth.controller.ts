import { Body, Controller, Post } from '@nestjs/common';
import {
  defaultCategories,
  defaultSubAccounts,
} from 'src/common/constants/user.constant';
import { UserService } from 'src/modules/user/user.service';
import { CreateCatgoryDTO } from '../categories/dto';
import { CreateSubAccountDTO } from '../sub-accounts/dto';
import { SubAccountService } from '../sub-accounts/sub-account.service';
import { CategoriesService } from './../categories/categories.service';
import { AuthService } from './auth.service';
import { SignInDTO, SignUpDTO } from './dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private subAccountService: SubAccountService,
    private categoriesService: CategoriesService,
    private userService: UserService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Post('signin')
  signin(@Body() dto: SignInDTO) {
    return this.authService.signin(dto);
  }

  @Post('signup')
  // async signup(@Body() dto: SignUpDTO) {
  //   const { user, token } = await this.authService.signup(dto);
  //   const subAccountPromises = defaultSubAccounts.map(async (accountName) => {
  //     const createSubAccountDto: CreateSubAccountDTO = {
  //       name: accountName,
  //       userId: user._id,
  //     };
  //     const subAccount =
  //       await this.subAccountService.create(createSubAccountDto);

  //     const categoryPromises = defaultCategories.map(async (category) => {
  //       const createCategoryDto: CreateCatgoryDTO = {
  //         type: category.type,
  //         label: category.label,
  //         subAccountId: subAccount._id,
  //         userId: user._id,
  //       };
  //       return this.categoriesService.create(createCategoryDto);
  //     });

  //     await Promise.all(categoryPromises);
  //     return subAccount;
  //   });

  //   const createdSubAccounts = await Promise.all(subAccountPromises);
  //   await this.userService.updateUserFirstSubAccount(
  //     user._id,
  //     createdSubAccounts[0]._id,
  //   );
  //   return { user, token };
  // }
  async signup(@Body() dto: SignUpDTO) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { user, token } = await this.authService.signup(dto);
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
