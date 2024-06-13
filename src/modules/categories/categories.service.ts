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

  // async create(dto: SignUpDTO): Promise<User> {
  //   const userInDB = await this.userModel.findOne({ email: dto.email });
  //   if (userInDB) {
  //     throw new ConflictException('User already exists with this email');
  //   }

  //   const user = new this.userModel(dto);
  //   return user.save();
  // }

  // async find(query: FilterQuery<User>, paginateOptions?: PaginateOptions) {
  //   return await this.userModel.paginate(query, paginateOptions);
  // }

  // async findByEmail(email: string): Promise<User | null> {
  //   const user = await this.userModel.findOne({ email }).exec();

  //   if (user) return user;
  //   else throw new NotFoundException(`User with email ${email} not found`);
  // }

  // async findById(userId: string): Promise<User | null> {
  //   const user = await this.userModel.findById(userId).exec();

  //   if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
  //   return user;
  // }

  // async findByIdandUpdate(
  //   userId: string,
  //   dto: UpdateProfileDTO,
  // ): Promise<User> {
  //   const user = await this.userModel
  //     .findByIdAndUpdate(userId, dto, { new: true })
  //     .exec();

  //   if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

  //   user.password = undefined;
  //   return user;
  // }

  // async findAll(filters?: FilterQuery<User>): Promise<User[]> {
  //   return await this.userModel.find(filters ? filters : {}).exec();
  // }
}
