SELECT
  `r`.`Id` AS `RoomId`,
  `r`.`DormitoryAreaId` AS `DormitoryAreaId`,
  `users`.`i`.`DormitoryAreaName` AS `DormitoryAreaName`,
  `r`.`BuildingId` AS `BuildingId`,
  `users`.`j`.`BuildingName` AS `BuildingName`,
  `r`.`ShareId` AS `ShareId`,
  `r`.`RoomType` AS `RoomType`,
  `users`.`k`.`RoomTypeName` AS `RoomTypeName`,
  `r`.`IsMale` AS `IsMale`,
(
    CASE
      WHEN (`r`.`IsMale` = 1) THEN '男'
      ELSE '女'
    END
  ) AS `GenderName`,
  `r`.`TotalBeds` AS `TotalBeds`,
  `r`.`ReservedBeds` AS `ReservedBeds`,
  `r`.`IsActive` AS `IsActive`,
  `r`.`UpdateAt` AS `UpdateAt`
FROM
  (
    (
      (
        `users`.`rooms` `r`
        LEFT JOIN `users`.`room_dormitory_area_list` `i` ON(
          (
            `users`.`i`.`DormitoryAreaId` = `r`.`DormitoryAreaId`
          )
        )
      )
      LEFT JOIN `users`.`room_building_list` `j` ON((`users`.`j`.`BuildingId` = `r`.`BuildingId`))
    )
    LEFT JOIN `users`.`room_type_list` `k` ON((`users`.`k`.`RoomType` = `r`.`RoomType`))
  )