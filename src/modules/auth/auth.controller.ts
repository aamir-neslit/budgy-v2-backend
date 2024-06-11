import { UserService } from 'src/modules/user/user.service';
import { CategoriesService } from './../categories/categories.service';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPassDTO, ResetPassDTO, SignInDTO, SignUpDTO } from './dto';
import { SubAccountService } from '../subAccounts/subAccount.service';
import { CreateSubAccountDTO } from '../subAccounts/dto';
import { CreateCatgoryDTO } from '../categories/dto';
import {
  defaultCategories,
  defaultSubAccounts,
} from 'src/common/constants/user.constant';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private subAccountService: SubAccountService,
    private categoriesService: CategoriesService,
    private userService: UserService,
  ) {}

  @Post('signin')
  signin(@Body() dto: SignInDTO) {
    return this.authService.signin(dto);
  }

  @Post('signup')
  async signup(@Body() dto: SignUpDTO) {
    const { user, token } = await this.authService.signup(dto);
    const subAccountPromises = defaultSubAccounts.map(async (accountName) => {
      const createSubAccountDto: CreateSubAccountDTO = {
        name: accountName,
        userId: user._id,
      };
      const subAccount =
        await this.subAccountService.create(createSubAccountDto);

      const categoryPromises = defaultCategories.map(async (category) => {
        const createCategoryDto: CreateCatgoryDTO = {
          type: category.type,
          label: category.label,
          subAccountId: subAccount._id,
          userId: user._id,
        };
        return this.categoriesService.create(createCategoryDto);
      });

      await Promise.all(categoryPromises);
      return subAccount;
    });

    const createdSubAccounts = await Promise.all(subAccountPromises);
    await this.userService.updateUserFirstSubAccount(
      user._id,
      createdSubAccounts[0]._id,
    );
    return { user, token };
  }

  // @Post('forget-password')
  // forgotPassword(@Body() dto: ForgotPassDTO) {
  //   return this.authService.forgotPassword(dto);
  // }

  // @Post('reset-password')
  // resetPassword(@Body() dto: ResetPassDTO) {
  //   return this.authService.resetPassword(dto);
  // }
}
