const partsAt = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

/** Converts a wall-clock value to an instant without consulting the device zone.
 * Ambiguous fall-back values resolve deterministically to the earlier instant. */
export function zonedLocalToIso(date: string, time: string, timeZone = "Europe/Berlin") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(?::00)?$/.test(time)) throw new Error("INVALID_LOCAL_TIME");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  const matches: number[] = [];
  // All civil offsets are within this bounded window; minute iteration also handles non-hour offsets.
  for (let offset = -14 * 60; offset <= 14 * 60; offset += 1) {
    const instant = naive - offset * 60_000;
    const p = partsAt(new Date(instant), timeZone);
    if (`${p.year}-${p.month}-${p.day}` === date && `${p.hour}:${p.minute}` === time.slice(0, 5) && p.second === "00") matches.push(instant);
  }
  if (!matches.length) throw new Error("NONEXISTENT_LOCAL_TIME");
  const iso = new Date(Math.min(...matches)).toISOString();
  const roundtrip = partsAt(new Date(iso), timeZone);
  if (`${roundtrip.year}-${roundtrip.month}-${roundtrip.day}T${roundtrip.hour}:${roundtrip.minute}:${roundtrip.second}` !== `${date}T${time.slice(0, 5)}:00`) throw new Error("INVALID_TIMEZONE_ROUNDTRIP");
  return iso;
}
