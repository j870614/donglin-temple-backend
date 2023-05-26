SELECT
  `users`.`item_name_mapping`.`ItemId` AS `DeaconId`,
  `users`.`item_name_mapping`.`ItemValue` AS `DeaconName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '執事名稱'
  )