SELECT
  `users`.`item_name_mapping`.`ItemId` AS `DeaconArea`,
  `users`.`item_name_mapping`.`ItemValue` AS `DeaconAreaName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '執事所屬地區'
  )