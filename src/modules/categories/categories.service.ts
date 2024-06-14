import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Categories } from 'src/models/categories.schema';
import { CreateCatgoryDTO } from './dto';
import { User } from 'src/models/user.schema';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) private categoryModel: Model<Categories>,
    private accountService: AccountService,
    private userService: UserService,
  ) {}

  async create(
    createCatgoryDTO: CreateCatgoryDTO,
    session?: ClientSession,
  ): Promise<Categories> {
    const { userId, accountId } = createCatgoryDTO;
    const category = new this.categoryModel({
      ...createCatgoryDTO,
      userId: new Types.ObjectId(userId),
      accountId: new Types.ObjectId(accountId),
    });
    return category.save({ session });
  }

  async updateCategoryLabel(
    categoryId: string,
    label: string,
  ): Promise<Categories> {
    const categoryObjectId = new Types.ObjectId(categoryId);
    const category = await this.categoryModel.findOneAndUpdate(
      { _id: categoryObjectId },
      { label },
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getUserSelectedAccountCategories(
    userId: string,
    accountId: string,
  ): Promise<Categories[]> {
    await this.userService.validateUser(userId);
    await this.accountService.validateAccount(accountId);

    const userObjectId = new Types.ObjectId(userId);
    const accountObjectId = new Types.ObjectId(accountId);
    const categories = await this.categoryModel
      .find({
        userId: userObjectId,
        accountId: accountObjectId,
      })
      .exec();

    if (!categories || categories.length === 0) {
      throw new NotFoundException(
        'No categories found for the specified user and account',
      );
    }

    return categories;
  }
}
