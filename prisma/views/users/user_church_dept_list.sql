SELECT
  `users`.`item_name_mapping`.`ItemId` AS `ChurchDept`,
  `users`.`item_name_mapping`.`ItemValue` AS `ChurchDeptName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '堂口部別'
  )