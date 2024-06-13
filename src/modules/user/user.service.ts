import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';
import { User, UserDocument } from '../../Models/user.schema';
import { SignUpDTO } from '../auth/dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: PaginateModel<User>) {}

  async updateUserFirstSubAccount(
    userId: string,
    accountId: string,
    session: ClientSession,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { selectedAccount: accountId },
        { new: true, session }, // required true so that it will return updated document
      )
      .exec();
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    user.password = undefined;
    return user;
  }

  async create(dto: SignUpDTO, session?: ClientSession): Promise<UserDocument> {
    const userInDB = await this.userModel.findOne({ email: dto.email });
    if (userInDB) {
      throw new ConflictException('User already exists with this email');
    }

    const user = new this.userModel(dto);
    return user.save({ session });
  }

  async find(query: FilterQuery<User>, paginateOptions?: PaginateOptions) {
    return await this.userModel.paginate(query, paginateOptions);
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();

    if (user) return user;
    else throw new NotFoundException(`User with email ${email} not found`);
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }
  async validateUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  }
}
