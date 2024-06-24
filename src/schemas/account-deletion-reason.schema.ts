import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class AccountDeletionReasons extends BaseSchema {
  @Prop()
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId;
}

export type AccountDeletionReasonsDocument = AccountDeletionReasons & Document;
export const AccountDeletionReasonsSchema = SchemaFactory.createForClass(
  AccountDeletionReasons,
);
