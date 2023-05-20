import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { users } from "@prisma/client";


export interface User {
  MobilePrefix?: string
  Mobile?: string
  Name?: string
  DharmaName?: string
  MageNickname?: string
  LineId?: string
  Email?: string
  IsMonk: boolean
  StayIdentity?: string | number
  IsMale: boolean
  BirthDate?: Date
  IdNumber?: string
  PassportNumber?: string
  BirthPlace?: string
  Phone?: string
  Ordination?: string
  Altar?: string
  ShavedMaster?: string
  ShavedDate?: Date
  OrdinationTemple?: string
  OrdinationDate?: Date
  ResidentialTemple?: string
  RefugueMaster?: string
  RefugueDate?: Date
  Referrer?: string
  ClothType?: number
  ClothSize?: string
  EmergencyName?: string
  EmergencyPhone?: string
  Relationship?: string
  Expertise?: Expertise
  Education?: string
  ComeTempleReason?: string
  HealthStatus?: HealthStatus
  EatBreakfast?: boolean
  EatLunch?: boolean
  EatDinner?: boolean
  Address?: Address
  Remarks?: string
}

interface Expertise {
  expertise?: string[],
}

interface HealthStatus {
  healthStatus?: string[],
}

interface Address {
  isForeign: boolean,
  continent?: string,
  zip?: number,
  county?: string,
  districts?: string,
  address: string,
}
