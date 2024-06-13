import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { UserService } from './user.service';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { DateFilter } from 'src/common/enums/user.enum';

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
    @Query('filter') filter: DateFilter = DateFilter.TODAY,
  ) {
    return await this.userService.getUserIncomeExpenseSummaryChart(
      userId,
      accountId,
      filter,
    );
  }
}
