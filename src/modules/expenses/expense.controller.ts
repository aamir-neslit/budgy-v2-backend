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
import { CreateExpenseDTO, GetUserExpensesDTO } from './dto';
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

  @Get('selected-account-expenses')
  async getUserSelectedAccountExpenses(
    @Request() req,
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('accountId', MongoIdValidationPipe) accountId: string,
    @Query() getUserExpensesDTO: GetUserExpensesDTO,
  ) {
    const { startDate, endDate } = getUserExpensesDTO;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return await this.expenseService.getExpensesBasedOnDuration(
      userId,
      accountId,
      start,
      end,
    );
  }
}
