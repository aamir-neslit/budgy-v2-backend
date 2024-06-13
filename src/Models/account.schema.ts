import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class Account extends BaseSchema {
  @Prop()
  name: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  recentExpense: number;

  @Prop({ default: 0 })
  recentIncome: number;

  @Prop({ default: 0 })
  totalExpense: number;

  @Prop({ default: 0 })
  totalIncome: number;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId;
}

export type AccountDocument = Account & Document;
export const AccountSchema = SchemaFactory.createForClass(Account);
