import { Controller, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { SubAccountService } from './sub-account.service';

@UseGuards(JwtAuthGuard)
@ApiTags('subAccount') //it for swagger
@Controller('subAccount')
export class UserController {
  constructor(private subAccountService: SubAccountService) {}
}
