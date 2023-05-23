/* eslint-disable */

export interface ResponseSuccess {
  status: boolean;
  message: string;
  data?: any;
}

export const responseSuccess = (message: string, data?: any) => ({
  status: true,
  message,
  data
});
