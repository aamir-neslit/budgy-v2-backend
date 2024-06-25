import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators';
import { DateFilter } from 'src/common/enums/user.enum';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { JwtAuthGuard } from '../../common/guards';
import { ChangePassDTO, DeleteUserDTO, UpdateProfileDTO } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('user-statistics')
  async userSelectedAccountStatistics(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('accountId', MongoIdValidationPipe) accountId: string,
  ) {
    await this.userService.updateUserSelectedAccount(userId, accountId);
    return await this.userService.getUserSelectedAccountStatistics(
      userId,
      accountId,
    );
  }

  @Get('user-income-expense-summary')
  async userIncomeExpenseSummaryChart(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('accountId', MongoIdValidationPipe) accountId: string,
    @Query('filter', new ValidationPipe({ transform: true }))
    filter: DateFilter = DateFilter.TODAY,
  ) {
    return await this.userService.getUserIncomeExpenseSummaryChart(
      userId,
      accountId,
      filter,
    );
  }

  @Post('change-password')
  async changePassword(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Body() dto: ChangePassDTO,
  ) {
    return await this.userService.changePassword(userId, dto);
  }

  @Patch('update-profile')
  async updateProfile(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Body() dto?: UpdateProfileDTO,
  ) {
    return await this.userService.findByIdandUpdate(userId, dto);
  }

  @Delete('delete-profile')
  async deleteUserProfile(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Body() dto: DeleteUserDTO,
  ) {
    const { reason } = dto;
    return await this.userService.deleteUserProfile(userId, reason);
  }

  @Delete('delete-user-account-data')
  async deleteUserAccountsData(
    @GetUser('id', MongoIdValidationPipe) userId: string,
  ) {
    return await this.userService.deleteUserAccountsData(userId);
  }
}
