import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { User } from 'src/Models/user.schema';

export class SignInDTO {
  @ApiProperty({
    example: 'alihamza.neslit@gmail.com',
    name: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Abc123',
    name: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignInResponseDTO {
  @ApiProperty({ type: User })
  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SignUpDTO {
  @ApiProperty({
    example: 'ali hamza',
    name: 'name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'email',
    example: 'alihamza.neslit@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    example: 'Abc123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPassDTO {
  @IsString()
  email: string;
}

export class ResetPassDTO {
  @IsString()
  email: string;

  @IsString()
  authCode: string;

  @IsString()
  newPassword: string;
}
