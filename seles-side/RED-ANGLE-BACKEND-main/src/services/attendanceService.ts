// import prisma from "../config/prisma";
// import { subDays, addDays } from "date-fns";

// const WORK_START_HOUR_UTC = 3;       // 9:00 AM IST  -> 03:30 UTC
// const WORK_START_MINUTE_UTC = 30;

// const HALF_DAY_HOURS = 5;  
// const ABSENT_IF_LESS_THAN_HOURS = 1;

// function getDateOnlyUTC(dt: Date) {
//   return new Date(Date.UTC(
//     dt.getUTCFullYear(),
//     dt.getUTCMonth(),
//     dt.getUTCDate()
//   ));
// }

// function hoursBetween(a: Date, b: Date) {
//   return Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60));
// }

// function isLateIn(checkIn: Date) {
//   const hour = checkIn.getUTCHours();
//   const minute = checkIn.getUTCMinutes();

//   if (hour > WORK_START_HOUR_UTC) return true;
//   if (hour === WORK_START_HOUR_UTC && minute > WORK_START_MINUTE_UTC) return true;

//   return false;
// }

// function computeStatus(checkIn?: Date | null, checkOut?: Date | null) {

//   if (!checkIn && !checkOut) return "absent";

//   if (checkIn && !checkOut) {
//     return isLateIn(checkIn) ? "late_in" : "present";
//   }

//   if (!checkIn && checkOut) return "absent";

//   const hrs = hoursBetween(checkIn!, checkOut!);

//   if (hrs < ABSENT_IF_LESS_THAN_HOURS) return "absent";
//   if (hrs < HALF_DAY_HOURS) return "half_day";
//   if (isLateIn(checkIn!)) return "late_in";

//   return "present";
// }
// function toIST(date: Date | null) {
//   if (!date) return null;
//   return new Date(date.getTime() + 330 * 60000); // 5.5 hrs = 330 mins
// }


// class AttendanceService {
//   async checkIn(employeeId: number, timestampIso?: string) {
//     const now = timestampIso ? new Date(timestampIso) : new Date();
//     const dateOnly = getDateOnlyUTC(now);

//     let existing = await prisma.employeesAttendance.findFirst({
//       where: { employeeId, date: dateOnly }
//     });

//     if (existing?.checkIn) return existing;

//     if (existing) {
//       return prisma.employeesAttendance.update({
//         where: { attendanceId: existing.attendanceId },
//         data: {
//           checkIn: now,
//           status: computeStatus(now, existing.checkOut)
//         }
//       });
//     }

//     return prisma.employeesAttendance.create({
//       data: {
//         employeeId,
//         date: dateOnly,
//         checkIn: now,
//         status: computeStatus(now, null)
//       }
//     });
//   }

//   async checkOut(employeeId: number, timestampIso?: string) {
//     const now = timestampIso ? new Date(timestampIso) : new Date();
//     const dateOnly = getDateOnlyUTC(now);

//     let existing = await prisma.employeesAttendance.findFirst({
//       where: { employeeId, date: dateOnly }
//     });

//     if (!existing) {
//       return prisma.employeesAttendance.create({
//         data: {
//           employeeId,
//           date: dateOnly,
//           checkOut: now,
//           status: computeStatus(null, now)
//         }
//       });
//     }

//     if (existing.checkOut) return existing;

//     return prisma.employeesAttendance.update({
//       where: { attendanceId: existing.attendanceId },
//       data: {
//         checkOut: now,
//         status: computeStatus(existing.checkIn, now)
//       }
//     });
//   }

//   async getAttendanceForDate(employeeId: number, dateIso: string) {
//     const date = dateIso ? new Date(dateIso) : new Date();
//     const dateOnly = getDateOnlyUTC(date);

//     const rec = await prisma.employeesAttendance.findFirst({
//       where: { employeeId, date: dateOnly }
//     });

//     if (!rec) {
//       return { employeeId, date: dateOnly, checkIn: null, checkOut: null, status: "absent" };
//     }

//    return { 
//   ...rec, 
//   checkIn: toIST(rec.checkIn),
//   checkOut: toIST(rec.checkOut),
//   status: computeStatus(rec.checkIn, rec.checkOut) 
// };

//   }

//   async getAttendanceRange(employeeId: number, fromIso: string, toIso: string) {
//     const fromDate = fromIso ? new Date(fromIso) : subDays(new Date(), 7);
//     const toDate = toIso ? new Date(toIso) : new Date();

//     const start = getDateOnlyUTC(fromDate);
//     const end = getDateOnlyUTC(toDate);

//     const days: Date[] = [];
//     for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
//       days.push(new Date(d));
//     }

//     const records = await prisma.employeesAttendance.findMany({
//       where: { employeeId, date: { gte: start, lte: end } }
//     });

//     const map = new Map();
//     for (const r of records) {
//       map.set(r.date.toISOString().slice(0, 10), r);
//     }

//     return days.map((d) => {
//       const key = d.toISOString().slice(0, 10);
//       const rec = map.get(key);

//       if (!rec) {
//         return { employeeId, date: d, checkIn: null, checkOut: null, status: "absent" };
//       }

//      return { 
//   ...rec, 
//   checkIn: toIST(rec.checkIn),
//   checkOut: toIST(rec.checkOut),
//   status: computeStatus(rec.checkIn, rec.checkOut) 
// };

//     });
//   }
//   async getMonthlyStats(employeeId: number, year: number, month: number) {
//     // Month range
//     const start = new Date(Date.UTC(year, month - 1, 1));
//     const end = new Date(Date.UTC(year, month, 1)); // next month


//     const records = await prisma.employeesAttendance.findMany({
//       where: {
//         employeeId,
//         date: {
//           gte: start,
//           lt: end
//         }
//       }
//     });


//     let presentDays = 0;
//     let lateDays = 0;


//     for (const rec of records) {
//       const status = computeStatus(rec.checkIn, rec.checkOut);


//       if (status === "present" || status === "late_in" || status === "half_day") {
//         presentDays++;
//       }


//       if (status === "late_in") {
//         lateDays++;
//       }
//     }


//     return {
//       employeeId,
//       year,
//       month,
//       presentDays,
//       lateDays,
//       totalRecords: records.length,
//     };
//   }

// }

// export default new AttendanceService();


import prisma from "../config/prisma";
import { subDays, addDays } from "date-fns";

const WORK_START_HOUR_UTC = 3;       // 9:00 AM IST  -> 03:30 UTC
const WORK_START_MINUTE_UTC = 30;

const HALF_DAY_HOURS = 5;
const ABSENT_IF_LESS_THAN_HOURS = 1;

function getDateOnlyUTC(dt: Date) {
  return new Date(Date.UTC(
    dt.getUTCFullYear(),
    dt.getUTCMonth(),
    dt.getUTCDate()
  ));
}

function hoursBetween(a: Date, b: Date) {
  return Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60));
}

function isLateIn(checkIn: Date) {
  const hour = checkIn.getUTCHours();
  const minute = checkIn.getUTCMinutes();

  if (hour > WORK_START_HOUR_UTC) return true;
  if (hour === WORK_START_HOUR_UTC && minute > WORK_START_MINUTE_UTC) return true;

  return false;
}

function computeStatus(checkIn?: Date | null, checkOut?: Date | null) {

  if (!checkIn && !checkOut) return "absent";

  if (checkIn && !checkOut) {
    return isLateIn(checkIn) ? "late_in" : "present";
  }

  if (!checkIn && checkOut) return "absent";

  const hrs = hoursBetween(checkIn!, checkOut!);

  if (hrs < ABSENT_IF_LESS_THAN_HOURS) return "absent";
  if (hrs < HALF_DAY_HOURS) return "half_day";
  if (isLateIn(checkIn!)) return "late_in";

  return "present";
}


class AttendanceService {
  async checkIn(employeeId: number, timestamp?: Date) {
  const now = timestamp ?? new Date();
    const dateOnly = getDateOnlyUTC(now);

    let existing = await prisma.employeesAttendance.findFirst({
      where: { employeeId, date: dateOnly }
    });

    if (existing?.checkIn) return existing;

    if (existing) {
      return prisma.employeesAttendance.update({
        where: { attendanceId: existing.attendanceId },
        data: {
          checkIn: now,
          status: computeStatus(now, existing.checkOut)
        }
      });
    }

    return prisma.employeesAttendance.create({
      data: {
        employeeId,
        date: dateOnly,
        checkIn: now,
        status: computeStatus(now, null)
      }
    });
  }

async checkOut(employeeId: number, timestamp?: Date) {
  const now = timestamp ?? new Date();
    const dateOnly = getDateOnlyUTC(now);

    let existing = await prisma.employeesAttendance.findFirst({
      where: { employeeId, date: dateOnly }
    });

    if (!existing) {
      return prisma.employeesAttendance.create({
        data: {
          employeeId,
          date: dateOnly,
          checkOut: now,
          status: computeStatus(null, now)
        }
      });
    }

    if (existing.checkOut) return existing;

    return prisma.employeesAttendance.update({
      where: { attendanceId: existing.attendanceId },
      data: {
        checkOut: now,
        status: computeStatus(existing.checkIn, now)
      }
    });
  }

async getAttendanceForDate(employeeId: number, dateIso: string) {
  const baseDate = dateIso ? new Date(dateIso) : new Date();

  // Start of the day
  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);

  // End of the day
  const endOfDay = new Date(baseDate);
  endOfDay.setHours(23, 59, 59, 999);

  const rec = await prisma.employeesAttendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // ✅ EARLY RETURN — rec is null
  if (!rec) {
    return {
      employeeId,
      date: startOfDay,
      checkIn: null,
      checkOut: null,
      totalHours: null,
      status: "absent",
    };
  }

  // ✅ SAFE to compute now
  let totalHours: string | null = null;

  if (rec.checkIn && rec.checkOut) {
    const diff =
      rec.checkOut.getTime() - rec.checkIn.getTime();

    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    totalHours = `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return {
    employeeId: rec.employeeId!,
    date: rec.date,
    checkIn: rec.checkIn,
    checkOut: rec.checkOut,
    totalHours,
    status: computeStatus(rec.checkIn, rec.checkOut),
  };
}


  async getAttendanceRange(employeeId: number, fromIso: string, toIso: string) {
    const fromDate = fromIso ? new Date(fromIso) : subDays(new Date(), 7);
    const toDate = toIso ? new Date(toIso) : new Date();

    const start = getDateOnlyUTC(fromDate);
    const end = getDateOnlyUTC(toDate);

    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      days.push(new Date(d));
    }

    const records = await prisma.employeesAttendance.findMany({
      where: { employeeId, date: { gte: start, lte: end } }
    });

    const map = new Map();
    for (const r of records) {
      map.set(r.date.toISOString().slice(0, 10), r);
    }

    return days.map((d) => {
      const key = d.toISOString().slice(0, 10);
      const rec = map.get(key);

      if (!rec) {
        return { employeeId, date: d, checkIn: null, checkOut: null, status: "absent" };
      }

     return { 
  ...rec, 
  status: computeStatus(rec.checkIn, rec.checkOut) 
};


    });
  }
  async getMonthlyStats(employeeId: number, year: number, month: number) {
    // Month range
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1)); // next month


    const records = await prisma.employeesAttendance.findMany({
      where: {
        employeeId,
        date: {
          gte: start,
          lt: end
        }
      }
    });


    let presentDays = 0;
    let lateDays = 0;


    for (const rec of records) {
      const status = computeStatus(rec.checkIn, rec.checkOut);


      if (status === "present" || status === "late_in" || status === "half_day") {
        presentDays++;
      }


      if (status === "late_in") {
        lateDays++;
      }
    }


    return {
      employeeId,
      year,
      month,
      presentDays,
      lateDays,
      totalRecords: records.length,
    };
  }

}

export default new AttendanceService();