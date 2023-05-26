SELECT
  `users`.`item_name_mapping`.`ItemId` AS `ChurchUnit`,
  `users`.`item_name_mapping`.`ItemValue` AS `ChurchUnitName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '堂口所屬單位'
  )