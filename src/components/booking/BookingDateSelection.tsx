import { Button } from "@/components/ui/button";
import type { AvailabilityDay } from "@/components/booking/CallbackBookingWidget";

export function BookingDateSelection({ days, locale, selectedDate, onDate, label }: { days: AvailabilityDay[]; locale: string; selectedDate?: string; onDate:(v:string)=>void; label:string }) {
  return <div>
    <fieldset><legend className="sr-only">{label}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {days.map((item) => <Button key={item.date} type="button" variant={selectedDate === item.date ? "default" : "outline"} className="h-12 whitespace-normal" aria-pressed={selectedDate === item.date} onClick={() => onDate(item.date)}>{new Intl.DateTimeFormat(locale, { weekday:"short", day:"2-digit", month:"short", timeZone:"Europe/Berlin" }).format(new Date(`${item.date}T12:00:00Z`))}</Button>)}
    </div></fieldset>
  </div>;
}

export function BookingTimeSelection({ day, locale, selectedTime, onTime, onBack, onContinue, labels }: { day:AvailabilityDay; locale:string; selectedTime?:string; onTime:(v:string)=>void; onBack:()=>void; onContinue:()=>void; labels:{date:string;selectedDate:string;time:string;back:string;continue:string} }) {
  const dateLabel=new Intl.DateTimeFormat(locale,{dateStyle:"full",timeZone:"Europe/Berlin"}).format(new Date(`${day.date}T12:00:00Z`));
  return <div className="space-y-6"><p className="rounded-lg bg-muted p-4"><strong>{labels.selectedDate}:</strong> {dateLabel}</p><fieldset><legend className="sr-only">{labels.time}</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{day.start_times.map((time)=><Button key={time} type="button" variant={selectedTime===time?"default":"outline"} className="min-h-11" aria-pressed={selectedTime===time} onClick={()=>onTime(time)}>{time.slice(0,5)}</Button>)}</div></fieldset><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="outline" className="min-h-11" onClick={onBack}>{labels.back}</Button><Button type="button" className="min-h-11" disabled={!selectedTime} onClick={onContinue}>{labels.continue}</Button></div></div>;
}
