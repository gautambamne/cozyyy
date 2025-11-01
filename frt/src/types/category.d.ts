import { string } from "zod";

interface ICategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface IGetCategoryResposne {
  categories: ICategory[];
  pagination: IPagination;
  message: string;
}

interface IActiveCategory {
  categories: ICategory[];
  message: string;
}

interface ICategoryResponse {
  // for update category, getbyid category
  category: ICategory;
  message: string;
}
