import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateExpenseDTO } from './dto';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('expense')
@Controller('expense')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post('add-expense')
  async addExpense(@Body() createExpenseDTO: CreateExpenseDTO) {
    return this.expenseService.create(createExpenseDTO);
  }
}
