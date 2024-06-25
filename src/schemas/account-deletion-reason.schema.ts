import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class AccountDeletionReasons extends BaseSchema {
  @Prop()
  reason: string;

  @Prop()
  @IsEmail()
  email: string;

  @Prop()
  name: string;
}

export type AccountDeletionReasonsDocument = AccountDeletionReasons & Document;
export const AccountDeletionReasonsSchema = SchemaFactory.createForClass(
  AccountDeletionReasons,
);
