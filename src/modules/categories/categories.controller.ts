import { Controller, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { CategoriesService } from './categories.service';

@UseGuards(JwtAuthGuard)
@ApiTags('user') //it for swagger
@Controller('user')
export class UserController {
  constructor(private categoriesService: CategoriesService) {}
}
