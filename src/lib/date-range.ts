export const rangePresets = [
  { key: "24h", label: "24 horas", days: 1 },
  { key: "7d", label: "7 días", days: 7 },
  { key: "30d", label: "30 días", days: 30 },
  { key: "90d", label: "90 días", days: 90 },
  { key: "100d", label: "100 días", days: 100 },
  { key: "365d", label: "365 días", days: 365 },
] as const;

export type PresetRangeKey = (typeof rangePresets)[number]["key"];
export type RangeKey = PresetRangeKey | "custom";

export type ResolvedRange = {
  key: RangeKey;
  start: Date;
  end: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function resolveRange(params: {
  range?: string;
  from?: string;
  to?: string;
}): ResolvedRange {
  const now = new Date();

  if (params.range === "custom" && params.from && params.to) {
    const from = new Date(params.from);
    const to = new Date(params.to);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      return { key: "custom", start: startOfDay(from), end: endOfDay(to) };
    }
  }

  const preset = rangePresets.find((p) => p.key === params.range) ?? rangePresets[2];
  const end = now;
  const start =
    preset.days === 1 ? new Date(now.getTime() - DAY_MS) : startOfDay(new Date(now.getTime() - preset.days * DAY_MS));

  return { key: preset.key, start, end };
}

export type Granularity = "hour" | "day" | "week" | "month";

export function pickGranularity(start: Date, end: Date): Granularity {
  const spanDays = (end.getTime() - start.getTime()) / DAY_MS;
  if (spanDays <= 2) return "hour";
  if (spanDays <= 45) return "day";
  if (spanDays <= 180) return "week";
  return "month";
}

function bucketStart(date: Date, granularity: Granularity): Date {
  const d = new Date(date);
  switch (granularity) {
    case "hour":
      d.setMinutes(0, 0, 0);
      return d;
    case "day":
      d.setHours(0, 0, 0, 0);
      return d;
    case "week": {
      d.setHours(0, 0, 0, 0);
      const dayOfWeek = (d.getDay() + 6) % 7; // 0 = lunes
      d.setDate(d.getDate() - dayOfWeek);
      return d;
    }
    case "month":
      return new Date(d.getFullYear(), d.getMonth(), 1);
  }
}

function bucketStep(date: Date, granularity: Granularity): Date {
  const d = new Date(date);
  switch (granularity) {
    case "hour":
      d.setHours(d.getHours() + 1);
      return d;
    case "day":
      d.setDate(d.getDate() + 1);
      return d;
    case "week":
      d.setDate(d.getDate() + 7);
      return d;
    case "month":
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
}

function bucketLabel(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case "hour":
      return date.toLocaleTimeString("es-ES", { hour: "2-digit" });
    case "day":
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    case "week":
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    case "month":
      return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
  }
}

export type SeriesBucket = { key: string; label: string; gastos: number; ingresos: number };

export function buildBuckets(start: Date, end: Date): {
  granularity: Granularity;
  buckets: SeriesBucket[];
  bucketIndex: Map<string, number>;
  bucketOf: (date: Date) => string;
} {
  const granularity = pickGranularity(start, end);
  const buckets: SeriesBucket[] = [];
  const bucketIndex = new Map<string, number>();

  let cursor = bucketStart(start, granularity);
  const last = bucketStart(end, granularity);
  // límite de seguridad para no generar miles de puntos con rangos absurdos
  let guard = 0;
  while (cursor.getTime() <= last.getTime() && guard < 500) {
    const key = cursor.toISOString();
    bucketIndex.set(key, buckets.length);
    buckets.push({ key, label: bucketLabel(cursor, granularity), gastos: 0, ingresos: 0 });
    cursor = bucketStep(cursor, granularity);
    guard += 1;
  }

  return {
    granularity,
    buckets,
    bucketIndex,
    bucketOf: (date: Date) => bucketStart(date, granularity).toISOString(),
  };
}
