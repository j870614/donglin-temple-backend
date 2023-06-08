SELECT
  `m`.`UserId` AS `UserId`,
  `ddp`.`IsSystemAdmin` AS `IsSystemAdmin`,
  `ddp`.`HasBuddhaSevenApply` AS `HasBuddhaSevenApply`,
  `ddp`.`HasRefugeApply` AS `HasRefugeApply`,
  `ddp`.`HasVisitAndActive` AS `HasVisitAndActive`,
  `ddp`.`HasRoomApply` AS `HasRoomApply`,
  `ddp`.`HasRoomInfo` AS `HasRoomInfo`,
  `ddp`.`HasArrangeService` AS `HasArrangeService`
FROM
  (
    (
      SELECT
        `users`.`managers`.`UserId` AS `UserId`,
        `users`.`managers`.`DeaconId` AS `DeaconId`
      FROM
        `users`.`managers`
      WHERE
        (
          (`users`.`managers`.`UserId` IS NOT NULL)
          AND (`users`.`managers`.`IsActive` = 1)
        )
    ) `m`
    LEFT JOIN `users`.`deacon_define_permissions` `ddp` ON((`m`.`DeaconId` = `ddp`.`Id`))
  )