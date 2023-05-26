SELECT
  `udc`.`Id` AS `Id`,
  `udc`.`UserId` AS `UserId`,
  `users`.`c`.`ChurchName` AS `ChurchName`,
  `users`.`dn`.`DeaconName` AS `DeaconName`,
  `users`.`da`.`DeaconAreaName` AS `DeaconAreaName`,
  `users`.`cu`.`ChurchUnitName` AS `ChurchUnitName`,
  `users`.`cd`.`ChurchDeptName` AS `ChurchDeptName`,
  `udc`.`StartDate` AS `StartDate`,
  `udc`.`EndDate` AS `EndDate`
FROM
  (
    (
      (
        (
          (
            `users`.`user_deacon_churchs` `udc`
            LEFT JOIN `users`.`user_church_name_list` `c` ON((`udc`.`ChurchId` = `users`.`c`.`ChurchId`))
          )
          LEFT JOIN `users`.`user_deacon_name_list` `dn` ON((`udc`.`DeaconId` = `users`.`dn`.`DeaconId`))
        )
        LEFT JOIN `users`.`user_deacon_area_list` `da` ON((`udc`.`DeaconArea` = `users`.`da`.`DeaconArea`))
      )
      LEFT JOIN `users`.`user_church_unit_list` `cu` ON((`udc`.`ChurchUnit` = `users`.`cu`.`ChurchUnit`))
    )
    LEFT JOIN `users`.`user_church_dept_list` `cd` ON((`udc`.`ChurchDept` = `users`.`cd`.`ChurchDept`))
  )