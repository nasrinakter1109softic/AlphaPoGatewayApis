export type ISuccessResponse<T = any> = {
  status: number;
  message: string;
  data: T;
  meta?: any;
  request?: {
    url?: string;
    method?: string;
    topics?: string;
  };
};

export type IErrorResponse = {
  status: number;
  message: string;
  error: any;
  request?: {
    url?: string;
    method?: string;
  };
};
