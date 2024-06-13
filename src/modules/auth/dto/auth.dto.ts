import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { User } from 'src/models/user.schema';

export class SignInDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
export class SignUpDTO extends PickType(SignInDTO, ['email', 'password']) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ForgotPassDTO extends PickType(SignInDTO, ['email']) {}
