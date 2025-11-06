interface ICart {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: IProductWishlist;
}

interface IAddToCartResponse { //for update cart resposne as well
  cartItem: ICart;
  message: string;
}

interface ISummary {
  subtotal: number
  discount: number
  total: number
  itemCount: number
}

interface IGetCartResponse {
  cart: {
    items: ICart[];
    summary: ISummary
  };
  pagination: IPagination
  message: string
}


