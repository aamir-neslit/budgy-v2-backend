import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSubAccountDTO {
  @ApiProperty({
    example: 'Home',
    name: 'name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 0,
    name: 'balance',
  })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty({
    example: 0,
    name: 'recentExpense',
  })
  @IsOptional()
  @IsNumber()
  recentExpense?: number;

  @ApiProperty({
    example: 0,
    name: 'recentIncome',
  })
  @IsOptional()
  @IsNumber()
  recentIncome?: number;

  @ApiProperty({
    example: 0,
    name: 'totalExpense',
  })
  @IsOptional()
  @IsNumber()
  totalExpense?: number;

  @ApiProperty({
    example: 0,
    name: 'totalIncome',
  })
  @IsOptional()
  @IsNumber()
  totalIncome?: number;

  @ApiProperty({
    example: '23434232423',
    description: 'User main Account Id',
    name: 'userId',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
