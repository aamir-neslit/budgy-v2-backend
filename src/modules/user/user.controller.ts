import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ChangePassDTO, UpdateProfileDTO } from './dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { User } from '../../Models/user.schema';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
}
