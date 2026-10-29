
import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const orderSchema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['новый', 'оплачен', 'отправлен', 'завершён', 'отменён'],
      default: 'новый',
    },
  },
  {
    timestamps: true,
  },
);

export type Order = InferSchemaType<typeof orderSchema>;

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
