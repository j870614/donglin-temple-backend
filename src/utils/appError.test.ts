import { StatusCodes } from "http-status-codes";
import { AppError, appError } from "./appError";

describe("appError unit tests", () => {
  let currentError: AppError;

  beforeEach(() => {
    currentError = new AppError("App Error", StatusCodes.BAD_REQUEST, true);
  });

  test(`AppError should be a Error`, () => {
    expect(Promise.reject(currentError)).rejects.toThrowError("App Error");
  });

  test(`appError should create new AppError`, () => {
    expect(
      Promise.reject(appError(StatusCodes.BAD_GATEWAY, "new Error"))
    ).rejects.toThrowError("new Error");
  });
});
