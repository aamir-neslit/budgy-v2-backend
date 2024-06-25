import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
