import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateExpenseDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  subAccountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;
}
