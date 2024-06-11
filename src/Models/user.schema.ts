import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as Paginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, Gender } from 'src/common/enums/user.enum';

@Schema()
export class User extends BaseSchema {
  @Prop()
  profilePicture: string;

  @Prop()
  name: string;

  @Prop({ unique: true, lowercase: true })
  @IsEmail()
  email: string;

  @Prop()
  password: string;

  @Prop()
  notificationsEnables: boolean;

  @Prop({ enum: Gender, default: Gender.MAN })
  @IsEnum(Gender)
  gender: Gender;

  @Prop({ enum: Currency, default: Currency.PKR })
  currencyCode: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: Types.ObjectId, ref: 'SubAccount', default: null })
  selectedSubAccount: Types.ObjectId;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User)
  .set('toJSON', {
    transform: function (doc, ret, opt) {
      delete ret['password'];
      delete ret['authCode'];
      return ret;
    },
  })
  .set('versionKey', false);

// If password is changed or this is a new user, generate hash
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  if (user.isModified('password') || user.isNew) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  next();
});

UserSchema.plugin(Paginate);
