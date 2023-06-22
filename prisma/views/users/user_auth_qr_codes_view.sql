SELECT
  `u`.`Id` AS `Id`,
  `u`.`UserId` AS `UserId`,
(
    CASE
      WHEN (`a`.`IsMale` = 1) THEN '男'
      ELSE '女'
    END
  ) AS `Gender`,
  `a`.`DharmaName` AS `DharmaName`,
  `a`.`Name` AS `Name`,
  `c`.`ChurchName` AS `ChurchName`,
  `users`.`d`.`DeaconId` AS `DeaconId`,
  `users`.`d`.`DeaconName` AS `DeaconName`,
  `u`.`AuthorizeUserId` AS `AuthorizeUserId`,
(
    CASE
      WHEN (`b`.`DharmaName` IS NOT NULL) THEN `b`.`DharmaName`
      ELSE `b`.`Name`
    END
  ) AS `AuthorizeName`,
  date_format((`u`.`EndTime` - INTERVAL 20 MINUTE), '%Y/%c/%e') AS `AuthorizeDate`,
(
    CASE
      WHEN (`u`.`HasUsed` = 1) THEN '已註冊'
      WHEN (
        (`u`.`HasUsed` = 0)
        AND (`u`.`EndTime` < NOW())
      ) THEN '註冊連結失效'
      ELSE '已產出註冊連結'
    END
  ) AS `Status`
FROM
  (
    (
      (
        (
          (
            `users`.`user_auth_qr_codes` `u`
            JOIN (
              SELECT
                `users`.`user_deacon_churchs`.`UserId` AS `UserId`,
                max(`users`.`user_deacon_churchs`.`EndDate`) AS `LatestEndDate`
              FROM
                `users`.`user_deacon_churchs`
              GROUP BY
                `users`.`user_deacon_churchs`.`UserId`
            ) `sub` ON((`u`.`UserId` = `sub`.`UserId`))
          )
          LEFT JOIN `users`.`user_deacon_churchs` `c` ON(
            (
              (`u`.`UserId` = `c`.`UserId`)
              AND (`sub`.`LatestEndDate` = `c`.`EndDate`)
            )
          )
        )
        LEFT JOIN `users`.`user_deacon_name_list` `d` ON((`u`.`DeaconId` = `users`.`d`.`DeaconId`))
      )
      LEFT JOIN `users`.`users` `a` ON((`u`.`UserId` = `a`.`Id`))
    )
    LEFT JOIN `users`.`users` `b` ON((`u`.`AuthorizeUserId` = `b`.`Id`))
  )