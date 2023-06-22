import { Prisma } from "@prisma/client";

export const prismaJsonParser = (
  prismaJson:
    | Prisma.NullableJsonNullValueInput
    | Prisma.InputJsonValue
    | Prisma.InputJsonObject
    | Prisma.InputJsonArray
    | undefined
): Prisma.InputJsonValue =>
  JSON.parse(prismaJson as string) as Prisma.InputJsonValue;
