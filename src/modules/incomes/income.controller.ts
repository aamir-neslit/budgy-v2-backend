import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { JwtAuthGuard } from '../../common/guards';
import { CreateIncomeDTO, GetUserIncomesDTO } from './dto';
import { IncomeService } from './income.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('income')
@Controller('income')
export class IncomeController {
  constructor(private incomeService: IncomeService) {}

  @Post('add-income')
  async addIncome(@Body() createIncomeDTO: CreateIncomeDTO) {
    return await this.incomeService.create(createIncomeDTO);
  }
  @Get('selected-account-incomes')
  async getUserSelectedAccountIncomes(
    @Request() req,
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('accountId', MongoIdValidationPipe) accountId: string,
    @Query() getUserIncomesDTO: GetUserIncomesDTO,
  ) {
    const { startDate, endDate } = getUserIncomesDTO;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return await this.incomeService.getIncomesBasedOnDuration(
      userId,
      accountId,
      start,
      end,
    );
  }
}
