interface IUser {
  lastName: string;
  firstName: string;
  id: string;
  name: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ILoginResponse {
  user: IUser;
  access_token: string;
  message: string;
}

interface IResgisterResponse {
  user: IUser;
  message: string;
}

interface IRefreshResponse {
  access_token: string;
  message: string;
}
