SELECT
  `u`.`Id` AS `Id`,
  `u`.`MobilePrefix` AS `MobilePrefix`,
  `u`.`Mobile` AS `Mobile`,
  `u`.`Name` AS `Name`,
  `u`.`DharmaName` AS `DharmaName`,
  `u`.`MageNickname` AS `MageNickname`,
  `u`.`LineId` AS `LineId`,
  `u`.`Email` AS `Email`,
  `u`.`IsMonk` AS `IsMonk`,
  `users`.`usi`.`StayIdentityName` AS `StayIdentityName`,
  `u`.`IsMale` AS `IsMale`,
  `u`.`BirthDate` AS `BirthDate`,
  `u`.`IdNumber` AS `IdNumber`,
  `u`.`PassportNumber` AS `PassportNumber`,
  `u`.`BirthPlace` AS `BirthPlace`,
  `u`.`Phone` AS `Phone`,
  `u`.`Ordination` AS `Ordination`,
  `u`.`Altar` AS `Altar`,
  `u`.`ShavedMaster` AS `ShavedMaster`,
  `u`.`ShavedDate` AS `ShavedDate`,
  `u`.`OrdinationTemple` AS `OrdinationTemple`,
  `u`.`OrdinationDate` AS `OrdinationDate`,
  `u`.`ResidentialTemple` AS `ResidentialTemple`,
  `u`.`RefugueMaster` AS `RefugueMaster`,
  `u`.`RefugueDate` AS `RefugueDate`,
  `u`.`Referrer` AS `Referrer`,
  `u`.`ClothType` AS `ClothType`,
  `u`.`ClothSize` AS `ClothSize`,
  `u`.`EmergencyName` AS `EmergencyName`,
  `u`.`EmergencyPhone` AS `EmergencyPhone`,
  `u`.`Relationship` AS `Relationship`,
  `u`.`Expertise` AS `Expertise`,
  `u`.`Education` AS `Education`,
  `u`.`ComeTempleReason` AS `ComeTempleReason`,
  `u`.`HealthStatus` AS `HealthStatus`,
  `u`.`EatBreakfast` AS `EatBreakfast`,
  `u`.`EatLunch` AS `EatLunch`,
  `u`.`EatDinner` AS `EatDinner`,
  `u`.`Address` AS `Address`,
  `u`.`Area` AS `Area`,
  `u`.`Height` AS `Height`,
  `u`.`Weight` AS `Weight`,
  `u`.`BloodType` AS `BloodType`,
  `u`.`Remarks` AS `Remarks`,
  `u`.`UpdateAt` AS `UpdateAt`
FROM
  (
    `users`.`users` `u`
    JOIN `users`.`user_stay_identity_list` `usi` ON(
      (
        `u`.`StayIdentity` = `users`.`usi`.`StayIdentity`
      )
    )
  )