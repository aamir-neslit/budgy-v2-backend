import { Controller, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { AccountService } from './account.service';

@UseGuards(JwtAuthGuard)
@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private AccountService: AccountService) {}
}
