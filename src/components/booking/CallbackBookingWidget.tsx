import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDateSelection } from "./BookingDateSelection";
import { BookingContactForm } from "./BookingContactForm";
import { availabilityRange, BOOKING_CALENDAR_SLUG, BOOKING_LOCATION_ID, BookingApiError, bookingRequest, PRIVACY_URL, readUtm } from "@/lib/publicBooking";
import { zonedLocalToIso } from "@/lib/publicBookingTimezone";
import { useBookingI18n } from "@/lib/publicBookingI18n";
import { useI18n } from "@/lib/i18n";

export type AvailabilityDay = { date:string; start_times:string[] };
type Availability = { calendar_name:string; timezone:string; duration_minutes:number; dates?:AvailabilityDay[]; availability?:AvailabilityDay[] };
type BookingSuccess = { calendar_name?:string; duration_minutes?:number; masked_email?:string; masked_phone?:string; status?:string; start_at?:string };
export type ContactData = { salutation:string; first_name:string; last_name:string; email:string; phone:string; note:string; consent:boolean; honeypot:string };
const initialContact: ContactData = { salutation:"",first_name:"",last_name:"",email:"",phone:"",note:"",consent:false,honeypot:"" };

export function CallbackBookingWidget() {
  const { b, lang } = useBookingI18n(); const { withLang } = useI18n();
  const locale = lang === "zh" ? "zh-CN" : lang;
  const [availability,setAvailability]=useState<Availability>(); const [loading,setLoading]=useState(true); const [loadError,setLoadError]=useState("");
  const [selectedDate,setSelectedDate]=useState(""); const [selectedTime,setSelectedTime]=useState(""); const [step,setStep]=useState<"slot"|"contact"|"success">("slot");
  const [contact,setContact]=useState(initialContact); const [errors,setErrors]=useState<Record<string,string>>({}); const [submitError,setSubmitError]=useState(""); const [submitting,setSubmitting]=useState(false); const [success,setSuccess]=useState<BookingSuccess>();
  const submissionRef=useRef<{fingerprint:string;id:string}>();
  const range=useMemo(()=>availabilityRange(),[]);
  const loadAvailability=useCallback(async()=>{ const controller=new AbortController(); setLoading(true);setLoadError(""); try { const data=await bookingRequest<Availability>({action:"availability",location_id:BOOKING_LOCATION_ID,calendar_slug:BOOKING_CALENDAR_SLUG,start_date:range.start,end_date:range.end},controller.signal); setAvailability(data); } catch(e) { if ((e as Error).name!=="AbortError") setLoadError(e instanceof BookingApiError&&e.code==="CONFIGURATION_ERROR"?b.config:b.generic); } finally { if(!controller.signal.aborted)setLoading(false); } return ()=>controller.abort(); },[b.config,b.generic,range.end,range.start]);
  useEffect(()=>{let cleanup:undefined|(()=>void);void loadAvailability().then((fn)=>cleanup=fn);return()=>cleanup?.();},[loadAvailability]);
  const days=(availability?.dates||availability?.availability||[]).filter((d)=>d.start_times?.length);
  const selectionLabel=selectedDate&&selectedTime?`${new Intl.DateTimeFormat(locale,{dateStyle:"full",timeZone:"Europe/Berlin"}).format(new Date(`${selectedDate}T12:00:00Z`))}, ${selectedTime.slice(0,5)}`:"";
  const messageFor=(code:string)=>code==="SLOT_UNAVAILABLE"?b.unavailable:code==="BOOKING_DISABLED"||code==="CALENDAR_DISABLED"?b.disabled:code==="RATE_LIMITED"?b.rate:code==="CONSENT_REQUIRED"?b.consentError:b.generic;
  const validate=()=>{const next:Record<string,string>={};(["salutation","first_name","last_name","email","phone"] as const).forEach((k)=>{if(!contact[k].trim())next[k]=b.required;});if(contact.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))next.email=b.invalidEmail;if(contact.phone&&!/^\+?[0-9 ()/.-]{6,40}$/.test(contact.phone))next.phone=b.invalidPhone;if(!contact.consent)next.consent=b.consentError;setErrors(next);return !Object.keys(next).length;};
  const submit=async()=>{if(submitting||!validate())return;setSubmitting(true);setSubmitError("");const start_at=zonedLocalToIso(selectedDate,selectedTime,availability?.timezone||"Europe/Berlin");const fingerprint=JSON.stringify({selectedDate,selectedTime,...contact});if(submissionRef.current?.fingerprint!==fingerprint)submissionRef.current={fingerprint,id:crypto.randomUUID()};try{const result=await bookingRequest<BookingSuccess>({action:"book",location_id:BOOKING_LOCATION_ID,calendar_slug:BOOKING_CALENDAR_SLUG,submission_id:submissionRef.current.id,start_at,salutation:contact.salutation,first_name:contact.first_name.trim(),last_name:contact.last_name.trim(),email:contact.email.trim(),phone:contact.phone.trim(),note:contact.note.trim(),consent_accepted:true,privacy_policy_url:PRIVACY_URL,language_code:lang,source_path:window.location.pathname,utm:readUtm(window.location.search),honeypot:contact.honeypot});setSuccess(result);setStep("success");submissionRef.current=undefined;}catch(e){const code=e instanceof BookingApiError?e.code:"INTERNAL_ERROR";setSubmitError(messageFor(code));if(code==="SLOT_UNAVAILABLE"){setSelectedTime("");setStep("slot");void loadAvailability();}}finally{setSubmitting(false);}};
  if(step==="success")return <Card className="mx-auto max-w-2xl"><CardContent className="py-10 text-center"><CalendarCheck className="mx-auto mb-4 size-14 text-primary"/><h2 className="text-2xl font-bold">{b.success}</h2><p className="mt-2 text-muted-foreground">{b.successBody}</p><dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-start"><dt>{b.summary}</dt><dd>{selectionLabel}</dd><dt>{b.calendar}</dt><dd>{success?.calendar_name||availability?.calendar_name}</dd><dt>{b.duration}</dt><dd>{success?.duration_minutes||availability?.duration_minutes} {b.minutes}</dd><dt>{b.email}</dt><dd>{success?.masked_email}</dd><dt>{b.phone}</dt><dd>{success?.masked_phone}</dd><dt>{b.status}</dt><dd>{success?.status||b.booked}</dd></dl><Button asChild className="mt-8"><Link to={withLang("/")}>{b.home}</Link></Button></CardContent></Card>;
  return <Card className="mx-auto max-w-4xl overflow-hidden"><CardHeader className="border-b bg-muted/30"><CardTitle className="flex items-center gap-2"><Clock className="size-5 text-primary"/>{step==="slot"?b.date:b.contact}</CardTitle></CardHeader><CardContent className="p-5 md:p-8"><div aria-live="polite">{loadError&&<div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4"><p className="flex gap-2"><AlertCircle/>{loadError}</p><Button variant="outline" className="mt-3" onClick={()=>void loadAvailability()}>{b.retry}</Button></div>}{submitError&&<p className="mb-5 rounded-lg bg-destructive/10 p-4 text-destructive">{submitError}</p>}</div>
  {step==="slot"&&(loading?<div className="space-y-3" aria-label={b.loading}><Skeleton className="h-12 w-full"/><Skeleton className="h-32 w-full"/></div>:days.length?<><BookingDateSelection days={days} locale={locale} selectedDate={selectedDate} selectedTime={selectedTime} onDate={(v)=>{setSelectedDate(v);setSelectedTime("");}} onTime={setSelectedTime} labels={b}/><div className="mt-8 flex justify-end"><Button disabled={!selectedTime} onClick={()=>setStep("contact")}>{b.continue}</Button></div></>:!loadError&&<div className="py-12 text-center text-muted-foreground">{b.empty}<div><Button variant="outline" className="mt-4" onClick={()=>void loadAvailability()}>{b.retry}</Button></div></div>)}
  {step==="contact"&&<><div className="mb-6 rounded-lg bg-muted p-4"><strong>{b.summary}:</strong> {selectionLabel}</div><BookingContactForm value={contact} onChange={(v)=>{setContact(v);setErrors({});}} onSubmit={()=>void submit()} submitting={submitting} errors={errors} b={b} privacyPath={withLang("/datenschutz")} onBack={()=>setStep("slot")}/></>}</CardContent></Card>;
}

