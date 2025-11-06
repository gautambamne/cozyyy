interface IAddress {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ICreateAddressResposne {
  // same for update address, setdefault, getbyid, default
  address: IAddress;
  message: string;
}

interface IGetAddressResponse {
  addresses: IAddress[];
  pagination: IPagination;
  message: string;
}

interface IGetStatsResponse {
  stats: {
    total: number
    defaultAddress: number
  };
  message:string
}
