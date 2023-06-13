SELECT
  `a`.`Id` AS `Id`,
  `a`.`UserId` AS `UserId`,
  `u`.`Name` AS `Name`,
  `u`.`DharmaName` AS `DharmaName`,
  `u`.`IsMonk` AS `IsMonk`,
  `u`.`IsMale` AS `IsMale`,
  `u`.`StayIdentity` AS `StayIdentity`,
  `users`.`sid`.`StayIdentityName` AS `StayIdentityName`,
  `u`.`Mobile` AS `Mobile`,
  `u`.`Phone` AS `Phone`,
  `u`.`EatBreakfast` AS `EatBreakfast`,
  `u`.`EatLunch` AS `EatLunch`,
  `u`.`EatDinner` AS `EatDinner`,
  `a`.`RoomId` AS `RoomId`,
  `users`.`r`.`DormitoryAreaName` AS `DormitoryAreaName`,
  `users`.`r`.`BuildingName` AS `BuildingName`,
  `users`.`r`.`ShareId` AS `ShareId`,
  `a`.`BedStayOrderNumber` AS `BedStayOrderNumber`,
  `a`.`CheckInDate` AS `CheckInDate`,
  `a`.`CheckOutDate` AS `CheckOutDate`,
  `a`.`CheckInDateBreakfast` AS `CheckInDateBreakfast`,
  `a`.`CheckInDateLunch` AS `CheckInDateLunch`,
  `a`.`CheckInDateDinner` AS `CheckInDateDinner`,
  `a`.`CheckInTime` AS `CheckInTime`,
  `a`.`CheckInUserId` AS `CheckInUserId`,
  `c`.`Name` AS `CheckInUserName`,
  `c`.`DharmaName` AS `CheckInUserDharmaName`,
  `c`.`IsMale` AS `CheckInUserIsMale`,
  `a`.`Status` AS `Status`,
  `a`.`Remarks` AS `Remarks`,
  `a`.`UpdateUserId` AS `UpdateUserId`,
  `u2`.`Name` AS `UpdateUserName`,
  `u2`.`DharmaName` AS `UpdateUserDharmaName`,
  `u2`.`IsMonk` AS `UpdateUserIsMale`,
  `a`.`UpdateAt` AS `UpdateAt`
FROM
  (
    (
      (
        (
          (
            `users`.`buddha_seven_apply` `a`
            LEFT JOIN `users`.`users` `u` ON((`a`.`UserId` = `u`.`Id`))
          )
          LEFT JOIN `users`.`users` `c` ON((`a`.`CheckInUserId` = `c`.`Id`))
        )
        LEFT JOIN `users`.`users` `u2` ON((`a`.`UpdateUserId` = `u2`.`Id`))
      )
      LEFT JOIN `users`.`user_stay_identity_list` `sid` ON(
        (
          `u`.`StayIdentity` = `users`.`sid`.`StayIdentity`
        )
      )
    )
    LEFT JOIN `users`.`rooms_view` `r` ON((`a`.`RoomId` = `users`.`r`.`RoomId`))
  )