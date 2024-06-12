import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { SubAccountService } from './sub-account.service';
import { CreateSubAccountDTO } from './dto';

@UseGuards(JwtAuthGuard)
@ApiTags('subAccount')
@Controller('subAccount')
export class SubAccountController {
  constructor(private subAccountService: SubAccountService) {}
}
