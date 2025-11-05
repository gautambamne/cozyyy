interface IProductWishlist {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: string[];
  jewelrySize: string;
  isActive: boolean;
  stock: number;
}

interface IItems {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  product: IProductWishlist;
}

interface IAddToWishlistResponse {
  item: IItems;
  message: string;
}

interface IGetWishlistResponse {
    items: IItems[]
    pagination: IPagination
    message: string
}
