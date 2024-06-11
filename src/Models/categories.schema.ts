import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class Categories extends BaseSchema {
  @Prop()
  type: string;

  @Prop()
  label: string;

  @Prop({ type: Types.ObjectId, ref: 'SubAccount', default: null })
  subAccountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId;
}

export type CategoriesDocument = Categories & Document;
export const CategoriesSchema = SchemaFactory.createForClass(Categories);
