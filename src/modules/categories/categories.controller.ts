import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { CategoriesService } from './categories.service';
import { CreateCatgoryDTO, UpdateCategoryDTO } from './dto';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { GetUser } from 'src/common/decorators';
import { UserService } from '../user/user.service';

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
  async addNewCategory(@Body() createIncomeDTO: CreateCatgoryDTO) {
    return await this.categoriesService.create(createIncomeDTO);
  }

  @Put('update-category')
  async updateCategoryLabel(
    @Request() req,
    @Body() updateCategoryDTO: UpdateCategoryDTO,
  ) {
    const { categoryId, label } = updateCategoryDTO;
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
