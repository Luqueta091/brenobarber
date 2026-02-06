import { addMinutes, endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function dayBounds(date: Date, timezone: string) {
  const zoned = toZonedTime(date, timezone);
  const start = fromZonedTime(startOfDay(zoned), timezone);
  const end = fromZonedTime(endOfDay(zoned), timezone);
  return { start, end };
}

export function getDiaSemana(date: Date, timezone: string) {
  const zoned = toZonedTime(date, timezone);
  return zoned.getDay();
}

export function applyTimeToDate(date: Date, time: string | Date, timezone: string) {
  const timeValue =
    time instanceof Date ? time.toISOString().slice(11, 19) : time;
  const zoned = toZonedTime(date, timezone);
  const year = zoned.getFullYear();
  const month = String(zoned.getMonth() + 1).padStart(2, "0");
  const day = String(zoned.getDate()).padStart(2, "0");
  const [hour, minute, second = "00"] = timeValue.split(":");
  const localIso = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  return fromZonedTime(localIso, timezone);
}

export function buildSlots(
  start: Date,
  end: Date,
  durationMinutes: number
): { inicio: Date; fim: Date }[] {
  const slots: { inicio: Date; fim: Date }[] = [];
  let cursor = start;
  while (cursor.getTime() + durationMinutes * 60_000 <= end.getTime()) {
    const fim = addMinutes(cursor, durationMinutes);
    slots.push({ inicio: cursor, fim });
    cursor = fim;
  }
  return slots;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}
