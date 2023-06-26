import prisma from "../configs/prismaClient";

export class CommonService {
  private static itemMappingCache: Record<string, Record<string, number>> = {};
  

  /**
   * 堂口 Id 換名稱
   * @param ChurchId 
   * @returns 項目名稱 or null
   */
  public static getChurchNameById(ChurchId: number){
    return this.changeToItemValue("堂口名稱", ChurchId);
  }

  /**
   * 
   * @param ChurchName 
   * @returns 項目 Id or -1
   */
  public static async getChurchIdByName(ChurchName: string){
    return this.changeToItemId("堂口名稱", ChurchName);
  }

  /**
   * 執事 Id 換名稱
   * @param deaconId 
   * @returns 項目名稱 or null
   */
  public static async getDeaconNameById(deaconId: number){
    return this.changeToItemValue("執事名稱", deaconId);
  }

  /**
   * 取得執事名稱換 Id
   * @param deaconName 執事名稱
   * @returns 項目 Id or -1
   */
  public static async getDeaconIdByName(deaconName: string){
    return this.changeToItemId("執事名稱", deaconName);
  }

   /**
   * 項目名稱換 Id（有快取用快取，沒有從 DB 拿）
   * @param groupName 項目種類
   * @param itemValue 項目名稱
   * @returns 項目 Id or -1
   */
  private static async changeToItemId(
    groupName: string,
    itemValue: string
  ): Promise<number> {
    // 檢查快取有沒有資料
    if(!CommonService.itemMappingCache[groupName]){
      // 從 DB 取回整個 group
      const result = await this.setItemGroupCache(groupName);
      if(!result){
        return -1;
      }
    }

    return CommonService.getItemIdByCache(groupName, itemValue);       
  }
  
  /**
   * 項目 Id 換名稱（有快取用快取，沒有從 DB 拿）
   * @param groupName 項目種類名稱 
   * @param Id 項目 Id
   * @returns 項目名稱 or null
   */
  private static async changeToItemValue(groupName: string, Id: number): Promise<string | null> {
    // 檢查快取有沒有資料
    if (!CommonService.itemMappingCache[groupName]) {
      const result = await this.setItemGroupCache(groupName);
      if(!result){
        return null;
      }
    }

    const itemValue = CommonService.getItemValueByCache(groupName, Id);
    return itemValue;
  }

  /**
   * 取 itemMappingCache 做名稱換 Id
   * @param groupName itemMapping group 名稱
   * @param itemValue 要換 Id 的名稱
   * @returns 
   */
  private static getItemIdByCache(groupName: string, itemValue: string) {
    if (CommonService.itemMappingCache[groupName]
      && (CommonService.itemMappingCache[groupName][itemValue]
        || CommonService.itemMappingCache[groupName][itemValue] === 0)) {
      return Number(CommonService.itemMappingCache[groupName][itemValue]);
    }
    return -1;
  }
  
  private static getItemValueByCache(groupName: string, Id: number): string | null {
    const groupCache = CommonService.itemMappingCache[groupName];
    if (groupCache) {
      const itemValue = Object.keys(groupCache).find(key => groupCache[key] === Id);
      return itemValue || null;
    }
    return null;
  }

  private static async setItemGroupCache(groupName: string){
    // 從 DB 取回整個 group
    const items = (await prisma.item_name_mapping.findMany({
      where: { 
        GroupName: groupName,  
        ItemValue: { not: null }
      },
      select: {
        ItemValue: true,        
        ItemId: true
      }
    })) as { ItemValue: string; ItemId: number; }[];

    if(items){
      // 轉存快取
      CommonService.itemMappingCache[groupName] = items.reduce((cache, item) => {
        const { ItemValue, ItemId } = item;
        return {
          ...cache,
          [ItemValue]: Number(ItemId)
        };
      }, {});
      if(CommonService.itemMappingCache[groupName]){
        return true;
      }
    }
    return false;
  }
}
 
