SELECT
  `users`.`item_name_mapping`.`ItemId` AS `BuildingId`,
  `users`.`item_name_mapping`.`ItemValue` AS `BuildingName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '寮房大樓'
  )