import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { User } from 'src/Models/user.schema';
import { JwtAuthGuard } from '../../common/guards';
import { CreateIncomeDTO } from './dto';
import { IncomeService } from './income.service';
import { Connection } from 'mongoose';

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
}
