import moment from "moment";
import { BuddhaSevenAppliesService } from "./buddhaSevenApplies.service";
import { BuddhaSevenApplyCheckInRequest } from "../../models";
import { getStartAndEndOfToday } from "../../utils/useDate";
import { BuddhaSevenApplyStatus } from "../../enums/buddhaSevenApplies.enum";

export class BuddhaSevenCheckInService extends BuddhaSevenAppliesService {
  async findManyOfTodayApplies() {
    const [startOfDay, endOfDay] = getStartAndEndOfToday();
    const buddhaSevenApplies =
      await this.prismaClient.buddha_seven_apply.findMany({
        where: {
          CheckInDate: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        orderBy: { Id: "asc" },
        take: 100,
        skip: 0
      });

    return buddhaSevenApplies;
  }

  async findManyViewsOfTodayApplies() {
    const [startOfDay, endOfDay] = getStartAndEndOfToday();

    const buddhaSevenApplies =
      await this.prismaClient.buddha_seven_apply_view.findMany({
        where: {
          CheckInDate: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        orderBy: { Id: "asc" },
        take: 100,
        skip: 0
      });

    return buddhaSevenApplies;
  }

  async findOneViewByMobileOrPhoneOfTodayApplies(mobileOrPhone: string) {
    const [startOfDay, endOfDay] = getStartAndEndOfToday();
    const buddhaSevenApplyView =
      await this.prismaClient.buddha_seven_apply_view.findFirst({
        where: {
          CheckInDate: {
            gte: startOfDay,
            lt: endOfDay
          },
          OR: [{ Mobile: mobileOrPhone }, { Phone: mobileOrPhone }]
        }
      });
    return buddhaSevenApplyView;
  }

  async checkInOneById(
    id: number,
    buddhaSevenApplyCheckInRequest: BuddhaSevenApplyCheckInRequest
  ) {
    const buddhaSevenApply = await this.prismaClient.buddha_seven_apply.update({
      where: { Id: id },
      data: {
        ...buddhaSevenApplyCheckInRequest,
        Status: BuddhaSevenApplyStatus.CHECKED_IN,
        CheckInTime: moment().toDate()
      }
    });
    return buddhaSevenApply;
  }
}
