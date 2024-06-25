import { ApiProperty, ApiQuery, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { DateFilter, Gender } from 'src/common/enums/user.enum';

export class UpdateProfileDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}

export class GetUserIncomeExpenseSummaryChartDTO {
  @ApiProperty({ enum: DateFilter, default: DateFilter.TODAY })
  @IsEnum(DateFilter)
  filter: DateFilter;

  @ApiProperty()
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsMongoId()
  accountId: string;
}

export class ChangePassDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class DeleteUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
