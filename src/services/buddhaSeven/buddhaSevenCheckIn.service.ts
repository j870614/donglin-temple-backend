import { Prisma } from "@prisma/client";

import moment from "moment";
import { BuddhaSevenAppliesService } from "./buddhaSevenApplies.service";
import { BuddhaSevenApplyCheckInRequest } from "../../models";
import { getStartAndEndOfToday } from "../../utils/useDate";
import { BuddhaSevenApplyStatus } from "../../enums/buddhaSevenApplies.enum";

export class BuddhaSevenCheckInService extends BuddhaSevenAppliesService {
  async findManyOfTodayApplies() {
    const [startOfDay, endOfDay] = getStartAndEndOfToday();

    const findManyArgs: Prisma.buddha_seven_applyFindManyArgs = {
      where: {
        CheckInDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: { Id: "asc" },
      take: 100,
      skip: 0
    };

    const buddhaSevenApplies = await this.findMany(findManyArgs);

    return buddhaSevenApplies;
  }

  async findOneByMobileOrPhoneOfTodayApplies(mobileOrPhone: string) {
    const [startOfDay, endOfDay] = getStartAndEndOfToday();
    const buddhaSevenApplyView = // TODO create a buddhaSevenApplyView service
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
    const buddhaSevenApply = await this.updateOneByIdAndUpdateData(id, {
      ...buddhaSevenApplyCheckInRequest,
      Status: BuddhaSevenApplyStatus.CHECKED_IN,
      CheckInTime: moment().toDate()
    });
    return buddhaSevenApply;
  }
}
