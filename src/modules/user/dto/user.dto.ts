import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { DateFilter } from 'src/common/enums/user.enum';

export class UpdateProfileDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsUrl()
  profilePicture: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
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
