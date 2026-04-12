export const HOLIDAYS = [
  "2024-01-01", "2024-02-09", "2024-02-12", "2024-03-01", "2024-04-10", "2024-05-05", "2024-05-06",
  "2024-05-15", "2024-06-06", "2024-08-15", "2024-09-16", "2024-09-17", "2024-09-18", "2024-10-03",
  "2024-10-09", "2024-12-25",
  "2025-01-01", "2025-01-28", "2025-01-29", "2025-01-30", "2025-03-03", "2025-05-05", "2025-05-06",
  "2025-06-06", "2025-08-15", "2025-10-03", "2025-10-06", "2025-10-07", "2025-10-08", "2025-10-09", "2025-12-25",
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-03-01", "2026-03-02", "2026-05-05",
  "2026-05-24", "2026-05-25", "2026-06-06", "2026-08-15", "2026-08-17", "2026-09-24", "2026-09-25",
  "2026-09-26", "2026-09-28", "2026-10-03", "2026-10-05", "2026-10-09", "2026-12-25"
];

export interface PricingResult {
  nights: number;
  baseNightly: number;
  guestSurcharge: number;
  weekendSurcharge: number;
  cleaningFee: number;
  discount: number;
  total: number;
}

export const calculateStayPrice = (
  stayId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): PricingResult | null => {
  if (!checkIn || !checkOut) return null;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  let baseNightly = 0;
  let guestSurcharge = 0;
  let weekendSurcharge = 0;

  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const day = currentDate.getDay();

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    const basePrice = stayId === 'deokeun' ? 60000 : 80000;
    baseNightly += basePrice;

    if (guests > 1) {
      guestSurcharge += (guests - 1) * 10000;
    }

    const isWeekend = day === 5 || day === 6; // Friday/Saturday nights
    if (isWeekend || HOLIDAYS.includes(dateStr)) {
      weekendSurcharge += 10000;
    }
  }

  const cleaningFee = 30000;
  let discount = 0;
  if (nights >= 14) discount = 40000;
  else if (nights >= 7) discount = 20000;

  const total = baseNightly + guestSurcharge + weekendSurcharge + cleaningFee - discount;

  return { nights, baseNightly, guestSurcharge, weekendSurcharge, cleaningFee, discount, total };
};
