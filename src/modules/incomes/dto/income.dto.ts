import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateIncomeDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount?: number;

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
