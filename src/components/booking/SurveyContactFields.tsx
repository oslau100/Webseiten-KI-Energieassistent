import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { germanPhoneLocalValue } from "@/lib/surveyContactFields";

type FieldProps={label:string;value:string;error?:string;onChange:(value:string)=>void};
const errorText=(id:string,error?:string)=>error&&<p id={id} className="mt-1 text-sm font-bold text-destructive">{error}</p>;

export function SurveyEmailField({label,value,error,onChange}:FieldProps){
 return <div><Label htmlFor="email">{label}</Label><Input id="email" name="email" type="email" inputMode="email" value={value} maxLength={254} autoComplete="email" aria-invalid={Boolean(error)} aria-describedby={error?"email-error":undefined} onChange={event=>onChange(event.target.value)}/>{errorText("email-error",error)}</div>;
}

export function SurveyGermanPhoneField({label,value,error,onChange}:FieldProps){
 return <div><Label htmlFor="phone">{label}</Label><div className="relative" dir="ltr"><span className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-11 -translate-y-1/2 items-center gap-2 rounded-xl border border-[#d6dee9] bg-white px-2.5 font-extrabold text-slate-900" aria-hidden="true"><img className="h-3 w-[18px] rounded-sm object-cover" src="https://flagcdn.com/w40/de.png" alt=""/><span className="text-[0.95rem] leading-none">+49</span></span><Input id="phone" name="phone" type="tel" inputMode="tel" value={value} maxLength={40} autoComplete="tel-national" className="h-[3.75rem] rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 ps-[130px] text-[1.15rem] font-semibold focus-visible:border-slate-300 focus-visible:bg-white focus-visible:ring-0" aria-invalid={Boolean(error)} aria-describedby={error?"phone-error":undefined} onChange={event=>onChange(germanPhoneLocalValue(event.target.value))}/></div>{errorText("phone-error",error)}</div>;
}
