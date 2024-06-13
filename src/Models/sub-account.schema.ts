import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class SubAccount extends BaseSchema {
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

// export type SubAccountDocument = HydratedDocument<SubAccount>;
export type SubAccountDocument = SubAccount & Document;
export const SubAccountSchema = SchemaFactory.createForClass(SubAccount);
