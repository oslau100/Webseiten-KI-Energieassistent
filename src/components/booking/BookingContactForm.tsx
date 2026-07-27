import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import type { ContactData } from "./CallbackBookingWidget";
import type { useBookingI18n } from "@/lib/publicBookingI18n";

export function BookingContactForm({ value, onChange, onSubmit, submitting, errors, b, privacyPath, onBack }: { value:ContactData; onChange:(v:ContactData)=>void; onSubmit:()=>void; submitting:boolean; errors:Record<string,string>; b:ReturnType<typeof useBookingI18n>["b"]; privacyPath:string; onBack:()=>void }) {
  const field = (name:keyof ContactData, label:string, type="text", autoComplete?:string, maxLength=100) => <div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} value={String(value[name])} maxLength={maxLength} autoComplete={autoComplete} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={(e)=>onChange({...value,[name]:e.target.value})}/>{errors[name]&&<p id={`${name}-error`} className="mt-1 text-sm text-destructive">{errors[name]}</p>}</div>;
  return <form className="space-y-5" noValidate onSubmit={(e)=>{e.preventDefault();onSubmit();}}>
    <div><Label htmlFor="salutation">{b.salutation}</Label><select id="salutation" className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={value.salutation} onChange={(e)=>onChange({...value,salutation:e.target.value})}><option value="">—</option><option>{b.ms}</option><option>{b.mr}</option><option>{b.diverse}</option></select>{errors.salutation&&<p className="text-sm text-destructive">{errors.salutation}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2">{field("first_name",b.first,"text","given-name",80)}{field("last_name",b.last,"text","family-name",80)}</div>
    <div className="grid gap-4 sm:grid-cols-2">{field("email",b.email,"email","email",254)}{field("phone",b.phone,"tel","tel",40)}</div>
    <div><Label htmlFor="note">{b.note}</Label><Textarea id="note" value={value.note} maxLength={1000} onChange={(e)=>onChange({...value,note:e.target.value})}/></div>
    <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" value={value.honeypot} onChange={(e)=>onChange({...value,honeypot:e.target.value})}/></div>
    <div className="flex items-start gap-3"><Checkbox id="consent" checked={value.consent} onCheckedChange={(checked)=>onChange({...value,consent:checked===true})}/><Label htmlFor="consent" className="leading-relaxed">{b.consent} <Link className="text-primary underline" target="_blank" to={privacyPath}>Datenschutz</Link></Label></div>{errors.consent&&<p className="text-sm text-destructive">{errors.consent}</p>}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="outline" onClick={onBack}>{b.back}</Button><Button type="submit" disabled={submitting}>{submitting ? b.loading : b.book}</Button></div>
  </form>;
}

