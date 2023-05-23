export interface GetManyRequest {
  order?: "asc" | "desc";
  take?: number;
  skip?: number;
}
