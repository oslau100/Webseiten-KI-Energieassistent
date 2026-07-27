import { Button } from "@/components/ui/button";
import type { AvailabilityDay } from "@/components/booking/CallbackBookingWidget";

export function BookingDateSelection({ days, locale, selectedDate, selectedTime, onDate, onTime, labels }: { days: AvailabilityDay[]; locale: string; selectedDate?: string; selectedTime?: string; onDate:(v:string)=>void; onTime:(v:string)=>void; labels:{date:string;time:string} }) {
  const day = days.find((item) => item.date === selectedDate);
  return <div className="space-y-6">
    <fieldset><legend className="mb-3 text-lg font-semibold">{labels.date}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {days.map((item) => <Button key={item.date} type="button" variant={selectedDate === item.date ? "default" : "outline"} className="h-12 whitespace-normal" aria-pressed={selectedDate === item.date} onClick={() => onDate(item.date)}>{new Intl.DateTimeFormat(locale, { weekday:"short", day:"2-digit", month:"short", timeZone:"Europe/Berlin" }).format(new Date(`${item.date}T12:00:00Z`))}</Button>)}
    </div></fieldset>
    {day && <fieldset><legend className="mb-3 text-lg font-semibold">{labels.time}</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{day.start_times.map((time) => <Button key={time} type="button" variant={selectedTime === time ? "default" : "outline"} className="min-h-11" aria-pressed={selectedTime === time} onClick={() => onTime(time)}>{time.slice(0,5)}</Button>)}</div></fieldset>}
  </div>;
}

