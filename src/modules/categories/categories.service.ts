import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Categories } from 'src/models/categories.schema';
import { CreateCatgoryDTO } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) private categoryModel: Model<Categories>,
  ) {}

  async create(
    dto: CreateCatgoryDTO,
    session: ClientSession,
  ): Promise<Categories> {
    const category = new this.categoryModel(dto);
    return category.save({ session });
  }
}
