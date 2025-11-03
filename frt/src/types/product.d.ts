interface IProduct {
  id: string
  name: string
  description: string
  price: number
  salePrice: number|null;
  stock: number
  images: string[];
  categoryId: string
  isActive: boolean
  jewelrySize: string
  createdAt: string
  updatedAt: string
}

interface IGetProductResponse { // for get category by categoryid
    products: IProduct[]
    pagination: IPagination
    message: string
}

interface IGetProductByIdResponse { // for create product and update product
    product: IProduct
    message: string
}

