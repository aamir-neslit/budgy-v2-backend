import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
// import { ChangePassDTO, UpdateProfileDTO } from './dto';
import { SubAccountService } from './subAccount.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { SubAccount } from '../../Models/subAccount.schema';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('subAccount') //it for swagger
@Controller('subAccount')
export class UserController {
  constructor(private subAccountService: SubAccountService) {}

  // @Get('me')
  // async getProfile(@GetUser() user: User) {
  //   return await this.userService.findById(user._id);
  // }

  // @Patch('me')
  // async updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDTO) {
  //   return await this.userService.findByIdandUpdate(user._id, dto);
  // }

  // @Post('change-password')
  // async changePassword(@GetUser() user: User, @Body() dto: ChangePassDTO) {
  //   return await this.userService.changePassword(user._id, dto);
  // }
}
