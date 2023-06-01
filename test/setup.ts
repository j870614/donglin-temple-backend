// import "jest-extended/all";
/* eslint-disable */
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "../src/configs/prismaClient";

jest.mock("../src/configs/prismaClient", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock };
