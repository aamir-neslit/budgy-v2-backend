import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCatgoryDTO {
  @ApiProperty({
    example: 'iconName',
    name: 'type',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'categoryName',
    name: 'label',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    example: '62g26uye3276327864823',
    description: 'should be user subAccount Id',
    name: 'subAccountId',
  })
  @IsString()
  @IsNotEmpty()
  subAccountId: string;

  @ApiProperty({
    example: '62g26uye3276327864823',
    description: 'should be user subAccount Id',
    name: 'subAccountId',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
