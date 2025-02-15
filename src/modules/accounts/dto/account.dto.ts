import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccountDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  recentExpense?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  recentIncome?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalExpense?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalIncome?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
