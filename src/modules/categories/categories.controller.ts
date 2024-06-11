import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
// import { ChangePassDTO, UpdateProfileDTO } from './dto';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { User } from '../../Models/user.schema';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('user') //it for swagger
@Controller('user')
export class UserController {
  constructor(private categoriesService: CategoriesService) {}

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
