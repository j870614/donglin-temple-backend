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
  `users`.`d`.`DeaconId` AS `DeaconId`,
  `users`.`d`.`DeaconName` AS `DeaconName`,
  `u`.`AuthorizeUserId` AS `AuthorizeUserId`,
  `b`.`DharmaName` AS `AuthorizeDharmaName`,
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
          `users`.`user_auth_qr_codes` `u`
          JOIN (
            SELECT
              `users`.`user_auth_qr_codes`.`UserId` AS `UserId`,
              max(`users`.`user_auth_qr_codes`.`EndTime`) AS `LatestEndTime`
            FROM
              `users`.`user_auth_qr_codes`
            GROUP BY
              `users`.`user_auth_qr_codes`.`UserId`
          ) `sub` ON(
            (
              (`u`.`UserId` = `sub`.`UserId`)
              AND (`u`.`EndTime` = `sub`.`LatestEndTime`)
            )
          )
        )
        LEFT JOIN (
          SELECT
            `users`.`users`.`Id` AS `Id`,
            `users`.`users`.`Name` AS `Name`,
            `users`.`users`.`DharmaName` AS `DharmaName`,
            `users`.`users`.`IsMale` AS `IsMale`
          FROM
            `users`.`users`
        ) `a` ON((`u`.`UserId` = `a`.`Id`))
      )
      LEFT JOIN (
        SELECT
          `users`.`users`.`Id` AS `Id`,
          `users`.`users`.`DharmaName` AS `DharmaName`
        FROM
          `users`.`users`
      ) `b` ON((`u`.`AuthorizeUserId` = `a`.`Id`))
    )
    LEFT JOIN `users`.`user_deacon_name_list` `d` ON((`u`.`DeaconId` = `users`.`d`.`DeaconId`))
  )