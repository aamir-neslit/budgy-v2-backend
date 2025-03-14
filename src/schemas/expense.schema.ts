import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class Expense extends BaseSchema {
  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
    required: true,
  })
  accountId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Categories',
    required: true,
  })
  categoryId: Types.ObjectId;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);
