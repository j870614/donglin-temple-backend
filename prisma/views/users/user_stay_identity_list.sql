SELECT
  `users`.`item_name_mapping`.`ItemId` AS `StayIdentity`,
  `users`.`item_name_mapping`.`ItemValue` AS `StayIdentityName`
FROM
  `users`.`item_name_mapping`
WHERE
  (
    `users`.`item_name_mapping`.`GroupName` = '住眾身分'
  )