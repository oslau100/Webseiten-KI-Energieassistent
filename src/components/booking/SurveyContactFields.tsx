import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { germanPhoneLocalValue } from "@/lib/surveyContactFields";

type FieldProps={label:string;value:string;error?:string;onChange:(value:string)=>void};
const errorText=(id:string,error?:string)=>error&&<p id={id} className="mt-1 text-sm font-bold text-destructive">{error}</p>;

export function SurveyEmailField({label,value,error,onChange}:FieldProps){
 return <div><Label htmlFor="email">{label}</Label><Input id="email" name="email" type="email" inputMode="email" value={value} maxLength={254} autoComplete="email" aria-invalid={Boolean(error)} aria-describedby={error?"email-error":undefined} onChange={event=>onChange(event.target.value)}/>{errorText("email-error",error)}</div>;
}

export function SurveyGermanPhoneField({label,value,error,onChange}:FieldProps){
 return <div><Label htmlFor="phone">{label}</Label><div className="relative" dir="ltr"><span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap text-base" aria-hidden="true">🇩🇪 +49</span><Input id="phone" name="phone" type="tel" inputMode="tel" value={value} maxLength={40} autoComplete="tel-national" className="pl-[5.5rem]" aria-invalid={Boolean(error)} aria-describedby={error?"phone-error":undefined} onChange={event=>onChange(germanPhoneLocalValue(event.target.value))}/></div>{errorText("phone-error",error)}</div>;
}
