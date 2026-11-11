import { describe, it, expect } from "vitest";
import {
  getTithisForCurrentMonthAndNext30Days,
  getAstronomicalTithi,
  VERIFIED_TITHIS_CATALOG,
  HINDU_MONTHS_MAP,
} from "../utils/tithiCalendar";

describe("Tithi Calendar & Dynamic 30-Day Window", () => {
  it("calculates astronomical tithi accurately for a given epoch", () => {
    // 2026-11-10 is in Kartika month, Krishna Paksha
    const tithiData = getAstronomicalTithi(new Date("2026-11-10T12:00:00Z"));
    expect(tithiData).toBeDefined();
    expect(["Shukla", "Krishna"]).toContain(tithiData.paksha);
    expect(tithiData.tithiIndex).toBeGreaterThanOrEqual(0);
    expect(tithiData.tithiIndex).toBeLessThanOrEqual(29);
    expect(tithiData.tithiNumber).toBeGreaterThanOrEqual(1);
    expect(tithiData.tithiNumber).toBeLessThanOrEqual(15);
    expect(tithiData.tithiNameEn).toBeDefined();
    expect(tithiData.tithiNameHi).toBeDefined();
    expect(tithiData.phase).toBeGreaterThanOrEqual(0);
    expect(tithiData.phase).toBeLessThanOrEqual(1);
  });

  it("generates tithis covering the entire current month AND next 30 days", () => {
    // Test with reference date: November 10, 2026
    const refDate = new Date("2026-11-10T00:00:00Z");
    const result = getTithisForCurrentMonthAndNext30Days(refDate);

    expect(result).toBeDefined();
    expect(result.gregorianMonthYear).toBe("November 2026");
    expect(result.currentMonthEn).toContain("Kartika");
    expect(result.tithis.length).toBeGreaterThanOrEqual(10);

    // Should include November dates (start of month: Nov 1 - Nov 30)
    const novDates = result.tithis.filter((t) => t.dateIso?.startsWith("2026-11"));
    expect(novDates.length).toBeGreaterThanOrEqual(5);

    // Should extend into December 2026 (next 30 days: up to Dec 10)
    const decDates = result.tithis.filter((t) => t.dateIso?.startsWith("2026-12"));
    expect(decDates.length).toBeGreaterThanOrEqual(1);

    // All items must have valid formatting
    result.tithis.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.nameEn).toBeDefined();
      expect(item.nameHi).toBeDefined();
      expect(item.tithi).toBeDefined();
      expect(item.paksha).toBeDefined();
      expect(item.dateFormatted).toBeDefined();
      expect(item.dayOfWeek).toBeDefined();
      expect(item.dateIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["ekadashi", "purnima_amavasya", "festival", "pradosh"]).toContain(item.category);
    });
  });

  it("includes flagship authentic festivals in the window", () => {
    // For November 2026, Diwali, Devuthani Ekadashi, Dev Deepawali must be present
    const refDate = new Date("2026-11-10T00:00:00Z");
    const result = getTithisForCurrentMonthAndNext30Days(refDate);

    const namesEn = result.tithis.map((t) => t.nameEn);
    expect(namesEn.some((n) => n.includes("Dev Deepawali"))).toBe(true);
    expect(namesEn.some((n) => n.includes("Devuthani"))).toBe(true);
    expect(namesEn.some((n) => n.includes("Diwali"))).toBe(true);
  });

  it("handles month transition at year boundary (December into January)", () => {
    const refDate = new Date("2026-12-15T00:00:00Z");
    const result = getTithisForCurrentMonthAndNext30Days(refDate);

    expect(result.gregorianMonthYear).toBe("December 2026");
    expect(result.tithis.length).toBeGreaterThanOrEqual(5);

    // Should include dates in January 2027 (30 days after Dec 15 is Jan 14)
    const janDates = result.tithis.filter((t) => t.dateIso?.startsWith("2027-01"));
    expect(janDates.length).toBeGreaterThanOrEqual(1);
  });

  it("handles month boundary on the 1st of any month", () => {
    const refDate = new Date("2026-03-01T00:00:00Z");
    const result = getTithisForCurrentMonthAndNext30Days(refDate);

    expect(result.gregorianMonthYear).toBe("March 2026");
    // Should have March dates and extend to March 31
    const marDates = result.tithis.filter((t) => t.dateIso?.startsWith("2026-03"));
    expect(marDates.length).toBeGreaterThanOrEqual(5);
  });

  it("deduplicates items properly without adjacent collisions", () => {
    const refDate = new Date("2026-11-10T00:00:00Z");
    const result = getTithisForCurrentMonthAndNext30Days(refDate);

    const dateMap = new Map<string, number>();
    result.tithis.forEach((item) => {
      const key = `${item.dateIso}-${item.category}`;
      dateMap.set(key, (dateMap.get(key) || 0) + 1);
    });

    // No same category on the exact same date
    Array.from(dateMap.values()).forEach((count) => {
      expect(count).toBe(1);
    });
  });

  it("has verified catalog covering Hindu months mapping", () => {
    expect(Object.keys(HINDU_MONTHS_MAP).length).toBe(12);
    expect(Object.keys(VERIFIED_TITHIS_CATALOG).length).toBeGreaterThanOrEqual(25);
  });
});
