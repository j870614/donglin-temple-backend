import { Prisma } from "@prisma/client";

export interface UserCreateRequest {
  MobilePrefix?: string;
  Mobile?: string;
  Name?: string;
  DharmaName?: string;
  MageNickname?: string;
  LineId?: string;
  Email?: string;
  IsMonk: boolean;
  StayIdentity?: string | number;
  IsMale: boolean;
  BirthDate?: Date;
  IdNumber?: string;
  PassportNumber?: string;
  BirthPlace?: string;
  Phone?: string;
  Ordination?: string;
  Altar?: string;
  ShavedMaster?: string;
  ShavedDate?: Date;
  OrdinationTemple?: string;
  OrdinationDate?: Date;
  ResidentialTemple?: string;
  RefugueMaster?: string;
  RefugueDate?: Date;
  Referrer?: string;
  ClothType?: string;
  ClothSize?: string;
  EmergencyName?: string;
  EmergencyPhone?: string;
  Relationship?: string;
  Expertise?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  Education?: string;
  ComeTempleReason?: string;
  HealthStatus?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  Height?: number;
  Weight?: number;
  BloodType?: string;
  EatBreakfast?: boolean;
  EatLunch?: boolean;
  EatDinner?: boolean;
  Area?: string;
  Address?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  Remarks?: string;
}
