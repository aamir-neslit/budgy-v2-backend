import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import * as Paginate from 'mongoose-paginate-v2';
import { Currency, Gender } from 'src/common/enums/user.enum';
import { BaseSchema } from 'src/common/schemas';

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

  @Prop({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @Prop({ enum: Currency, default: Currency.PKR })
  currencyCode: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: Types.ObjectId, ref: 'Account', default: null })
  selectedAccount: Types.ObjectId;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User)
  .set('toJSON', {
    transform: function (doc, ret, opt) {
      delete ret['password'];
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
