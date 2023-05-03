import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import validator from "validator";

import { appError } from "../utils/appError";
import { responseSuccess } from "../utils/responseSuccess";

export class UsersController {
  constructor(private readonly data: string) {}
}
