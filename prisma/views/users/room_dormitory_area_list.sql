SELECT
  `users`.`item_name_mapping`.`ItemId` AS `DormitoryAreaId`,
  `users`.`item_name_mapping`.`ItemValue` AS `DormitoryAreaName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '寮房區域'
  )