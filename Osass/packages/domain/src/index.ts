export * from "./performance";
export * from "./status";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  status?: number;
}

export interface PagedResult<T> {
  results: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
  lowerBoundSize?: number;
  upperBoundSize?: number;
}
