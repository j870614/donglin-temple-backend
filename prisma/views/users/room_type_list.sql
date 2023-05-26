SELECT
  `users`.`item_name_mapping`.`ItemId` AS `RoomType`,
  `users`.`item_name_mapping`.`ItemValue` AS `RoomTypeName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '寮房性質'
  )