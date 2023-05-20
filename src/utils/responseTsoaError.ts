import { IsValidHeader } from "@tsoa/runtime/dist/utils/isHeaderType";
import { Response } from "express";
import { HttpStatusCodeLiteral } from "tsoa";

export type TsoaResponse<
  T extends HttpStatusCodeLiteral,
  BodyType,
  HeaderType extends IsValidHeader<HeaderType> = object | string | string[]
> = (status: T, data: BodyType, headers?: HeaderType) => Response;
