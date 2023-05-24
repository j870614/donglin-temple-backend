SELECT
  `users`.`item_name_mapping`.`ItemId` AS `ChurchId`,
  `users`.`item_name_mapping`.`ItemValue` AS `ChurchName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '堂口名稱'
  )