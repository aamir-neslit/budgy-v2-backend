import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { UserService } from './user.service';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('user-statistics')
  async userStatistics(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('subAccountId', MongoIdValidationPipe) subAccountId: string,
  ) {
    return await this.userService.getUserStatistics(userId, subAccountId);
  }
}
