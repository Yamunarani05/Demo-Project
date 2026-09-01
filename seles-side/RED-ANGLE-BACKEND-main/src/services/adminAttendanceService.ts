import prisma from "../config/prisma";
import { addDays, subDays } from "date-fns";

/* -------------------- CONSTANTS -------------------- */

// 9:30 AM IST = 04:00 UTC
const WORK_START_HOUR_UTC = 4;
const WORK_START_MINUTE_UTC = 0;

const HALF_DAY_HOURS = 5;
const ABSENT_IF_LESS_THAN_HOURS = 1;

// IST offset = +5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/* -------------------- HELPERS -------------------- */

// Convert timestamp → IST date → UTC start of that IST day
// Converts a timestamp to IST day start stored as UTC
function getISTDateStartUTC(timestamp: Date) {
  const istYear = timestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric" });
  const istMonth = timestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "numeric" });
  const istDay = timestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric" });

  return new Date(Date.UTC(
    Number(istYear),
    Number(istMonth) - 1,
    Number(istDay),
    0, 0, 0, 0
  ));
}


function hoursBetween(a: Date, b: Date) {
  return Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60));
}

function isLateIn(checkIn: Date) {
  const h = checkIn.getUTCHours();
  const m = checkIn.getUTCMinutes();

  if (h > WORK_START_HOUR_UTC) return true;
  if (h === WORK_START_HOUR_UTC && m > WORK_START_MINUTE_UTC) return true;

  return false;
}

function computeStatus(checkIn?: Date | null, checkOut?: Date | null) {
  if (!checkIn && !checkOut) return "absent";

  if (checkIn && !checkOut)
    return isLateIn(checkIn) ? "late_in" : "present";

  if (!checkIn && checkOut) return "absent";

  const hrs = hoursBetween(checkIn!, checkOut!);

  if (hrs < ABSENT_IF_LESS_THAN_HOURS) return "absent";
  if (hrs < HALF_DAY_HOURS) return "half_day";
  if (isLateIn(checkIn!)) return "late_in";

  return "present";
}

/* -------------------- SERVICE -------------------- */

class AdminAttendanceService {

  /* ---------- CHECK IN ---------- */
  async checkIn(userId: number, checkInTimestamp?: Date) {
  const checkInTime = checkInTimestamp ?? new Date();

  const dateUTC = getISTDateStartUTC(checkInTime);
  const nextDateUTC = addDays(dateUTC, 1);

  const existing = await prisma.adminAttendance.findFirst({
    where: {
      userId,
      date: { gte: dateUTC, lt: nextDateUTC },
    },
  });

  if (existing?.checkIn) return existing;

  if (existing) {
    return prisma.adminAttendance.update({
      where: { attendanceId: existing.attendanceId },
      data: {
        checkIn: checkInTime,
        status: computeStatus(checkInTime, existing.checkOut),
      },
    });
  }

  return prisma.adminAttendance.create({
    data: {
      userId,
      date: dateUTC,
      checkIn: checkInTime,
      status: computeStatus(checkInTime, null),
    },
  });
}

  /* ---------- CHECK OUT ---------- */
  async checkOut(userId: number, checkOutTimestamp?: Date) {
  const checkOutTime = checkOutTimestamp ?? new Date();

  const dateUTC = getISTDateStartUTC(checkOutTime);
  const nextDateUTC = addDays(dateUTC, 1);

  const existing = await prisma.adminAttendance.findFirst({
    where: {
      userId,
      date: { gte: dateUTC, lt: nextDateUTC },
    },
  });

  if (!existing) {
    return prisma.adminAttendance.create({
      data: {
        userId,
        date: dateUTC,
        checkOut: checkOutTime,
        status: computeStatus(null, checkOutTime),
      },
    });
  }

  if (existing.checkOut) return existing;

  return prisma.adminAttendance.update({
    where: { attendanceId: existing.attendanceId },
    data: {
      checkOut: checkOutTime,
      status: computeStatus(existing.checkIn, checkOutTime),
    },
  });
}

  async getAttendanceForDate(userId: number, dateIso: string) {
    const baseDate = dateIso ? new Date(dateIso) : new Date();

    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const rec = await prisma.adminAttendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (!rec) {
      return {
        userId,
        date: startOfDay,
        checkIn: null,
        checkOut: null,
        totalHours: null,
        status: "absent"
      };
    }

    let totalHours: string | null = null;

    if (rec.checkIn && rec.checkOut) {
      const diff = rec.checkOut.getTime() - rec.checkIn.getTime();

      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      totalHours = `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return {
      userId: rec.userId!,
      date: rec.date,
      checkIn: rec.checkIn,
      checkOut: rec.checkOut,
      totalHours,
      status: computeStatus(rec.checkIn, rec.checkOut)
    };
  }
async getAttendanceRange(userId: number, fromIso?: string, toIso?: string) {
 const fromBase =
    fromIso && !isNaN(new Date(fromIso).getTime())
      ? new Date(fromIso)
      : subDays(new Date(), 7);
   const toBase =
    toIso && !isNaN(new Date(toIso).getTime())
      ? new Date(toIso)
      : new Date();

  // ✅ Convert to IST-day UTC start
  const startUTC = getISTDateStartUTC(fromBase);
  const endUTC = getISTDateStartUTC(toBase);
  const endNextUTC = addDays(endUTC, 1);

  /* -------- Build IST day list -------- */
  const days: Date[] = [];
  for (let d = new Date(startUTC); d <= endUTC; d = addDays(d, 1)) {
    days.push(new Date(d));
  }

  /* -------- Fetch DB records -------- */
  const records = await prisma.adminAttendance.findMany({
    where: {
      userId,
      date: {
        gte: startUTC,
        lt: endNextUTC
      }
    }
  });

  /* -------- Map by YYYY-MM-DD -------- */
  const map = new Map<string, any>();
  for (const r of records) {
    const key = r.date.toISOString().slice(0, 10);
    map.set(key, r);
  }

  /* -------- Merge result -------- */
  return days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const rec = map.get(key);

    if (!rec) {
      return {
        userId,
        date: d,
        checkIn: null,
        checkOut: null,
        status: "absent"
      };
    }

    return {
      ...rec,
      status: computeStatus(rec.checkIn, rec.checkOut)
    };
  });
}

  async getMonthlyStats(userId: number, year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const records = await prisma.adminAttendance.findMany({
      where: {
        userId,
        date: { gte: start, lt: end }
      }
    });

    let presentDays = 0;
    let lateDays = 0;

    for (const rec of records) {
      const status = computeStatus(rec.checkIn, rec.checkOut);

      if (["present", "late_in", "half_day"].includes(status)) {
        presentDays++;
      }

      if (status === "late_in") {
        lateDays++;
      }
    }

    return {
      userId,
      year,
      month,
      presentDays,
      lateDays,
      totalRecords: records.length
    };
  }
}

export default new AdminAttendanceService();
