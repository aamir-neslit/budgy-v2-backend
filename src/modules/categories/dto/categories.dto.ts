import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDTO {
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
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

export class UpdateCategoryDTO extends PickType(CreateCategoryDTO, ['label']) {}
