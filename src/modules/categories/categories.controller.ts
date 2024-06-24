import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { JwtAuthGuard } from '../../common/guards';
import { UserService } from '../user/user.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Categories') //it for swagger
@Controller('categories')
export class UserController {
  constructor(
    private categoriesService: CategoriesService,
    private userService: UserService,
  ) {}

  @Post('add-category')
  async addNewCategory(@Body() createIncomeDTO: CreateCategoryDTO) {
    return await this.categoriesService.create(createIncomeDTO);
  }

  @Patch('update-category')
  async updateCategoryLabel(
    @Query('categoryId', MongoIdValidationPipe) categoryId: string,
    @Body() updateCategoryDTO: UpdateCategoryDTO,
  ) {
    const { label } = updateCategoryDTO;
    return await this.categoriesService.updateCategoryLabel(categoryId, label);
  }

  @Get('all-categories')
  async allSelectedAccountCategories(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('accountId', MongoIdValidationPipe) accountId: string,
  ) {
    return await this.categoriesService.getUserSelectedAccountCategories(
      userId,
      accountId,
    );
  }
}
