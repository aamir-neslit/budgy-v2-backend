import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class Categories extends BaseSchema {
  @Prop({ default: null })
  type: string;

  @Prop({ default: 0 })
  label: string;

  @Prop({ type: Types.ObjectId, ref: 'SubAccount', default: null, _id: false })
  subAccountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, _id: false })
  userId: Types.ObjectId;
}

export type CategoriesDocument = Categories & Document;
export const CategoriesSchema = SchemaFactory.createForClass(Categories);
