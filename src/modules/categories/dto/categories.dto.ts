import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCatgoryDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  subAccountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
