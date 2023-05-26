SELECT
  (
    ((`a`.`DormitoryAreaId` * 100) + `a`.`BuildingId`) * 100
  ) AS `Id`,
  `a`.`DormitoryAreaId` AS `DormitoryAreaId`,
  `users`.`b`.`DormitoryAreaName` AS `DormitoryAreaName`,
  `a`.`BuildingId` AS `BuildingId`,
  `users`.`c`.`BuildingName` AS `BuildingName`
FROM
  (
    (
      (
        SELECT
          `users`.`rooms`.`DormitoryAreaId` AS `DormitoryAreaId`,
          `users`.`rooms`.`BuildingId` AS `BuildingId`
        FROM
          `users`.`rooms`
        GROUP BY
          `users`.`rooms`.`DormitoryAreaId`,
          `users`.`rooms`.`BuildingId`
      ) `a`
      LEFT JOIN `users`.`room_dormitory_area_list` `b` ON(
        (
          `a`.`DormitoryAreaId` = `users`.`b`.`DormitoryAreaId`
        )
      )
    )
    LEFT JOIN `users`.`room_building_list` `c` ON((`a`.`BuildingId` = `users`.`c`.`BuildingId`))
  )