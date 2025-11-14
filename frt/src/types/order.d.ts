interface ISummary {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayOrders: number;
  thisWeekOrders: number;
  thisMonthOrders: number;
}

interface IItemsOrder {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: IItemsOrder[];
  payment: IPayment
}

interface IPayment {
  id: string
  orderId: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  stripePaymentId: string|null;
  createdAt: string
  updatedAt: string
}

interface IPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface ICreateOrderResponse { //same for cancel order , get product by by id, for update order status
    order: IOrder
    paymentIntent?: IPaymentIntent; // Only present for CARD payments
    message: string
}

interface IGetOrderResponse {
    order: IOrder[]
    pagination: IPagination
    message: string
}
interface IGetSummaryResposne {
  summary: ISummary;
  message: string;
}
