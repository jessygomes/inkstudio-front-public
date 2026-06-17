const DEFAULT_BUSINESS_TIME_ZONE = "Europe/Paris";

export type SlotDisplayMode = "raw" | "timezone";

type OpeningWindow = { start?: string; end?: string } | null | undefined;

type TimeZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getTimeZoneParts(date: Date, timeZone: string): TimeZoneParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;

    if (!value) {
      throw new Error(`Missing ${type} for timezone conversion`);
    }

    return Number(value);
  };

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    0,
  );

  return asUtc - date.getTime();
}

function zonedWallTimeToUtc(
  date: string,
  time: string,
  timeZone: string,
) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);

  const utcGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, 0),
  );
  const firstOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  let result = new Date(utcGuess.getTime() - firstOffset);

  const refinedOffset = getTimeZoneOffsetMs(result, timeZone);
  if (refinedOffset !== firstOffset) {
    result = new Date(utcGuess.getTime() - refinedOffset);
  }

  return result;
}

function addOneDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));

  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

export function toDateInputValue(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function getIsoDatePart(iso: string) {
  return iso.slice(0, 10);
}

export function getIsoTimePart(iso: string) {
  return iso.slice(11, 16);
}

export function getDateKeyInTimeZone(
  value: Date | string,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = getTimeZoneParts(date, timeZone);

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function getTimeInTimeZone(
  value: Date | string,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = getTimeZoneParts(date, timeZone);

  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function addMinutesToIsoInTimeZone(
  iso: string,
  minutesToAdd: number,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) {
  const shifted = new Date(new Date(iso).getTime() + minutesToAdd * 60000);
  return getTimeInTimeZone(shifted, timeZone);
}

export function getWeekdayKeyFromDate(
  date: string,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
  })
    .format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)))
    .toLowerCase();
}

function getCandidateWindow(
  firstSlot: string,
  lastSlot: string,
  mode: SlotDisplayMode,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) {
  const start =
    mode === "timezone"
      ? getTimeInTimeZone(firstSlot, timeZone)
      : getIsoTimePart(firstSlot);
  const end =
    mode === "timezone"
      ? addMinutesToIsoInTimeZone(lastSlot, 30, timeZone)
      : addMinutesToTime(getIsoTimePart(lastSlot), 30);

  return { start, end };
}

export function resolveSlotDisplayMode(
  slotStarts: string[],
  opening: OpeningWindow,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
): SlotDisplayMode {
  if (!opening?.start || !opening?.end || slotStarts.length === 0) return "raw";

  const firstSlot = slotStarts[0];
  const lastSlot = slotStarts[slotStarts.length - 1];
  const rawWindow = getCandidateWindow(firstSlot, lastSlot, "raw", timeZone);
  const zonedWindow = getCandidateWindow(
    firstSlot,
    lastSlot,
    "timezone",
    timeZone,
  );

  const openingStart = timeToMinutes(opening.start);
  const openingEnd = timeToMinutes(opening.end);
  const rawStart = timeToMinutes(rawWindow.start);
  const rawEnd = timeToMinutes(rawWindow.end);
  const zonedStart = timeToMinutes(zonedWindow.start);
  const zonedEnd = timeToMinutes(zonedWindow.end);

  const rawExact = rawStart === openingStart && rawEnd === openingEnd;
  const zonedExact = zonedStart === openingStart && zonedEnd === openingEnd;
  if (rawExact && !zonedExact) return "raw";
  if (zonedExact && !rawExact) return "timezone";

  const rawDiff = Math.abs(rawStart - openingStart) + Math.abs(rawEnd - openingEnd);
  const zonedDiff =
    Math.abs(zonedStart - openingStart) + Math.abs(zonedEnd - openingEnd);

  return rawDiff <= zonedDiff ? "raw" : "timezone";
}

export function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
  const nextMinutes = String(normalizedMinutes % 60).padStart(2, "0");

  return `${nextHours}:${nextMinutes}`;
}

export function formatDateKeyForDisplay(date: string, locale = "fr-FR") {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

export function getDayRangeForTimeZone(
  date: string,
  timeZone = DEFAULT_BUSINESS_TIME_ZONE,
) {
  const start = zonedWallTimeToUtc(date, "00:00:00", timeZone);
  const nextDayStart = zonedWallTimeToUtc(addOneDay(date), "00:00:00", timeZone);
  const end = new Date(nextDayStart.getTime() - 1);

  return {
    start,
    end,
  };
}

export { DEFAULT_BUSINESS_TIME_ZONE };