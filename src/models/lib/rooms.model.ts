export interface Room {
  Id: number;
  DormitoryAreaId: number;
  BuildingId: number;
  ShareId: number;
  RoomType: number;
  IsMale: boolean;
  TotalBeds: number;
  ReservedBeds: number;
  IsActive: boolean;
  UpdateAt: Date;
}

export interface ViewRoom {
  RoomId: number;
  DormitoryAreaId: number;
  DormitoryAreaName: string;
  BuildingId: number;
  BuildingName: string;
  ShareId: number;
  RoomType: number;
  RoomTypeName: string;
  IsMale: boolean;
  GenderName: string;
  TotalBeds: number;
  ReservedBeds: number;
  IsActive: boolean;
  UpdateAt: Date;
}
export interface ViewType {
  RoomType: number;
  RoomTypeName: string;
}
