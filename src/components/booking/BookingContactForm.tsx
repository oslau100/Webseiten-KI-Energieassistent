import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import type { ContactData } from "./CallbackBookingWidget";
import type { BookingTexts } from "@/lib/publicBookingI18n";
import { SurveyEmailField,SurveyGermanPhoneField } from "./SurveyContactFields";

type Props={value:ContactData;onChange:(value:ContactData)=>void;onSubmit:()=>void;submitting:boolean;errors:Record<string,string>;b:BookingTexts;privacyPath:string;onBack:()=>void};
export function BookingContactForm({value,onChange,onSubmit,submitting,errors,b,privacyPath,onBack}:Props){
 const consentParts=b.consent.split("{privacyLink}");
 const field=(name:keyof ContactData,label:string,type="text",autoComplete?:string,maxLength=100)=><div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} value={String(value[name])} maxLength={maxLength} autoComplete={autoComplete} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`${name}-error`:undefined} onChange={(event)=>onChange({...value,[name]:event.target.value})}/>{errors[name]&&<p id={`${name}-error`} className="mt-1 text-sm text-destructive">{errors[name]}</p>}</div>;
 return <form className="space-y-5" noValidate onSubmit={(event)=>{event.preventDefault();onSubmit();}}>
  <div><Label htmlFor="salutation">{b.salutation}</Label><select id="salutation" className="flex h-11 w-full rounded-md border border-input bg-background px-3" value={value.salutation} aria-invalid={Boolean(errors.salutation)} aria-describedby={errors.salutation?"salutation-error":undefined} onChange={(event)=>onChange({...value,salutation:event.target.value})}><option value="">—</option><option value={b.ms}>{b.ms}</option><option value={b.mr}>{b.mr}</option><option value={b.diverse}>{b.diverse}</option></select>{errors.salutation&&<p id="salutation-error" className="mt-1 text-sm text-destructive">{errors.salutation}</p>}</div>
  <div className="grid gap-4 sm:grid-cols-2">{field("first_name",b.first,"text","given-name",80)}{field("last_name",b.last,"text","family-name",80)}</div>
  <div className="grid gap-4 sm:grid-cols-2"><SurveyEmailField label={b.email} value={value.email} error={errors.email} onChange={email=>onChange({...value,email})}/><SurveyGermanPhoneField label={b.phone} value={value.phone} error={errors.phone} onChange={phone=>onChange({...value,phone})}/></div>
  <div><Label htmlFor="note">{b.note}</Label><Textarea id="note" value={value.note} maxLength={1000} onChange={(event)=>onChange({...value,note:event.target.value})}/></div>
  <div hidden aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" value={value.honeypot} onChange={(event)=>onChange({...value,honeypot:event.target.value})}/></div>
  <div><div className="flex items-start gap-3"><Checkbox id="consent" checked={value.consent} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent?"consent-error":undefined} onCheckedChange={(checked)=>onChange({...value,consent:checked===true})}/><Label htmlFor="consent" className="leading-relaxed">{consentParts[0]}<Link className="text-primary underline" target="_blank" rel="noopener noreferrer" to={privacyPath}>{b.privacyLink}<span className="sr-only"> ({b.privacyNewTab})</span></Link>{consentParts[1]}</Label></div>{errors.consent&&<p id="consent-error" className="mt-1 text-sm text-destructive">{errors.consent}</p>}</div>
  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="outline" className="min-h-11" onClick={onBack}>{b.back}</Button><Button type="submit" className="min-h-11" disabled={submitting}>{submitting?b.submitting:b.book}</Button></div>
 </form>;
}
