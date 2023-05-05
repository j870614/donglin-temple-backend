import { Prisma, User } from "@prisma/client";
import { Observable } from "rxjs";
import { prisma } from "../configs/prismaClient";

export class ManagerService {
  constructor(private _data: User) {}

  createUser(data: User): User {
    return (this._data = data);
  }
}
