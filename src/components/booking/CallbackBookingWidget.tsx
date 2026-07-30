import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle,CalendarCheck,Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDateSelection,BookingTimeSelection } from "./BookingDateSelection";
import { BookingContactForm } from "./BookingContactForm";
import { availabilityRange,BOOKING_CALENDAR_SLUG,BOOKING_LOCATION_ID,BookingApiError,bookingRequest,PRIVACY_URL,readUtm } from "@/lib/publicBooking";
import { zonedLocalToIso } from "@/lib/publicBookingTimezone";
import { BOOKING_ERROR_CODES,getBookingErrorText,type BookingErrorCode,useBookingI18n } from "@/lib/publicBookingI18n";
import { useI18n } from "@/lib/i18n";
import { isValidSurveyEmail,normalizeGermanSurveyPhone,normalizeSurveyEmail } from "@/lib/surveyContactFields";
import { formatBookingDateTime } from "@/lib/publicBookingDateTime";

export type AvailabilityDay={date:string;start_times:string[]};
type Availability={calendar_name:string;calendar_slug:string;timezone:string;duration_minutes:number;dates?:AvailabilityDay[];availability?:AvailabilityDay[]};
export type BookingSuccess={booking_id:string;calendar_name:string;calendar_slug:string;start_at:string;end_at:string;timezone:string;duration_minutes:number;email:string;phone:string;status:string};
export type ContactData={salutation:string;first_name:string;last_name:string;email:string;phone:string;note:string;consent:boolean;honeypot:string};
const initialContact:ContactData={salutation:"",first_name:"",last_name:"",email:"",phone:"",note:"",consent:false,honeypot:""};
const isKnownCode=(value:string):value is BookingErrorCode=>(BOOKING_ERROR_CODES as readonly string[]).includes(value);

export function CallbackBookingWidget({onSuccessChange}:{onSuccessChange?:(success:boolean)=>void}={}){
 const{b,lang}=useBookingI18n();const{withLang}=useI18n();const locale=lang==="zh"?"zh-CN":lang;
 const[availability,setAvailability]=useState<Availability>();const[loading,setLoading]=useState(true);const[loadError,setLoadError]=useState("");
 const[selectedDate,setSelectedDate]=useState("");const[selectedTime,setSelectedTime]=useState("");const[step,setStep]=useState<"date"|"time"|"contact"|"success">("date");
 const[contact,setContact]=useState(initialContact);const[errors,setErrors]=useState<Record<string,string>>({});const[submitError,setSubmitError]=useState("");const[submitting,setSubmitting]=useState(false);const[success,setSuccess]=useState<BookingSuccess>();
 const submissionRef=useRef<{fingerprint:string;id:string}>();const availabilityController=useRef<AbortController>();const requestSequence=useRef(0);const mounted=useRef(true);const alertRef=useRef<HTMLDivElement>(null);const stepRef=useRef<HTMLHeadingElement>(null);const successRef=useRef<HTMLHeadingElement>(null);const range=useMemo(()=>availabilityRange(),[]);
 const errorText=useCallback((code:BookingErrorCode)=>getBookingErrorText(b,code),[b]);
 const loadAvailability=useCallback(async()=>{
  if(!lang)return;
  availabilityController.current?.abort();const controller=new AbortController();availabilityController.current=controller;const sequence=++requestSequence.current;
  if(mounted.current){setLoading(true);setLoadError("");}
  try{const data=await bookingRequest<Availability>({action:"availability",location_id:BOOKING_LOCATION_ID,calendar_slug:BOOKING_CALENDAR_SLUG,start_date:range.start,end_date:range.end},controller.signal);if(mounted.current&&!controller.signal.aborted&&sequence===requestSequence.current){setAvailability(data);return data;}}
  catch(error){if(mounted.current&&!controller.signal.aborted&&sequence===requestSequence.current&&(error as Error).name!=="AbortError"){const code=error instanceof BookingApiError&&isKnownCode(error.code)?error.code:"INTERNAL_ERROR";setLoadError(errorText(code));}}
  finally{if(mounted.current&&!controller.signal.aborted&&sequence===requestSequence.current)setLoading(false);}
 },[errorText,lang,range.end,range.start]);
 useEffect(()=>{mounted.current=true;void loadAvailability();return()=>{mounted.current=false;requestSequence.current+=1;availabilityController.current?.abort();};},[loadAvailability]);
 useEffect(()=>{if(submitError)alertRef.current?.focus();},[submitError]);useEffect(()=>{const successful=step==="success";onSuccessChange?.(successful);if(successful)successRef.current?.focus();else stepRef.current?.focus();},[onSuccessChange,step]);
 const days=(availability?.dates||availability?.availability||[]).filter(day=>day.start_times?.length);
 const selectionLabel=useMemo(()=>{if(!selectedDate||!selectedTime)return "";const timezone=availability?.timezone||"Europe/Berlin";try{return formatBookingDateTime(zonedLocalToIso(selectedDate,selectedTime,timezone),lang,timezone);}catch{return `${selectedDate}, ${selectedTime.slice(0,5)}`;}},[availability?.timezone,lang,selectedDate,selectedTime]);
 const normalizedPhone=()=>normalizeGermanSurveyPhone(contact.phone);
 const validate=()=>{const next:Record<string,string>={};(["salutation","first_name","last_name","email","phone"] as const).forEach(key=>{if(!contact[key].trim())next[key]=b.required;});if(contact.email&&!isValidSurveyEmail(contact.email))next.email=b.invalidEmail;if(contact.phone&&!normalizedPhone())next.phone=b.invalidPhone;if(!contact.consent)next.consent=b.error_CONSENT_REQUIRED;setErrors(next);if(Object.keys(next).length)requestAnimationFrame(()=>document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());return !Object.keys(next).length;};
 const submit=async()=>{if(submitting||!validate())return;setSubmitting(true);setSubmitError("");try{
  const start_at=zonedLocalToIso(selectedDate,selectedTime,availability?.timezone||"Europe/Berlin");const phone=normalizedPhone();if(!phone)throw new Error("INVALID_PHONE");
  const email=normalizeSurveyEmail(contact.email);const fingerprint=JSON.stringify({selectedDate,selectedTime,salutation:contact.salutation,first_name:contact.first_name.trim(),last_name:contact.last_name.trim(),email,phone,note:contact.note.trim()});if(submissionRef.current?.fingerprint!==fingerprint)submissionRef.current={fingerprint,id:crypto.randomUUID()};
  const result=await bookingRequest<BookingSuccess>({action:"book",location_id:BOOKING_LOCATION_ID,calendar_slug:BOOKING_CALENDAR_SLUG,submission_id:submissionRef.current.id,start_at,salutation:contact.salutation,first_name:contact.first_name.trim(),last_name:contact.last_name.trim(),email,phone,note:contact.note.trim(),consent_accepted:true,privacy_policy_url:PRIVACY_URL,language_code:lang,source_path:window.location.pathname,utm:readUtm(window.location.search),honeypot:contact.honeypot});if(!mounted.current)return;setSuccess(result);setStep("success");submissionRef.current=undefined;
 }catch(error){if(!mounted.current)return;if(error instanceof Error&&["INVALID_LOCAL_TIME","NONEXISTENT_LOCAL_TIME","INVALID_TIMEZONE_ROUNDTRIP"].includes(error.message)){setSubmitError(b.timeError);return;}const code=error instanceof BookingApiError&&isKnownCode(error.code)?error.code:"INTERNAL_ERROR";setSubmitError(errorText(code));if(code==="SLOT_UNAVAILABLE"||code==="MINIMUM_NOTICE_NOT_MET"){setSelectedTime("");const refreshed=await loadAvailability();if(!mounted.current)return;const refreshedDays=(refreshed?.dates||refreshed?.availability||[]).filter(day=>day.start_times?.length);setStep(refreshedDays.some(day=>day.date===selectedDate)?"time":"date");}}
 finally{if(mounted.current)setSubmitting(false);}};
 if(step==="success"&&success)return <Card className="mx-auto max-w-2xl"><CardContent className="py-10 text-center"><CalendarCheck className="mx-auto mb-4 size-14 text-primary"/><h2 ref={successRef} tabIndex={-1} className="text-2xl font-bold outline-none">{b.success}</h2><p className="mt-2 text-muted-foreground">{b.successBody}</p><dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-start"><dt>{b.summary}</dt><dd>{formatBookingDateTime(success.start_at,lang,success.timezone)}</dd><dt>{b.duration}</dt><dd>{success.duration_minutes} {b.minutes}</dd></dl><Button asChild className="mt-8"><Link to={withLang("/")}>{b.back}</Link></Button></CardContent></Card>;
 const selectedDay=days.find(day=>day.date===selectedDate);
 const title=step==="date"?b.date:step==="time"?b.time:b.contact;
 return <Card className="mx-auto max-w-4xl overflow-hidden"><CardHeader className="border-b bg-muted/30"><CardTitle ref={stepRef} tabIndex={-1} className="flex items-center gap-2 outline-none"><Clock className="size-5 text-primary"/>{title}</CardTitle></CardHeader><CardContent className="p-5 md:p-8"><div aria-live="assertive">{loadError&&<div ref={alertRef} tabIndex={-1} className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 outline-none"><p className="flex gap-2"><AlertCircle/>{loadError}</p><Button variant="outline" className="mt-3" onClick={()=>void loadAvailability()}>{b.retry}</Button></div>}{submitError&&<div ref={alertRef} tabIndex={-1} className="mb-5 rounded-lg bg-destructive/10 p-4 text-destructive outline-none">{submitError}</div>}</div>
 {step==="date"&&(loading?<div className="space-y-3" role="status" aria-label={b.loading}><Skeleton className="h-12 w-full"/><Skeleton className="h-32 w-full"/></div>:days.length?<BookingDateSelection days={days} locale={locale} selectedDate={selectedDate} onDate={value=>{if(value!==selectedDate)setSelectedTime("");setSelectedDate(value);setSubmitError("");setStep("time");}} label={b.date}/>:!loadError&&<div className="py-12 text-center text-muted-foreground">{b.empty}<div><Button variant="outline" className="mt-4" onClick={()=>void loadAvailability()}>{b.retry}</Button></div></div>)}
 {step==="time"&&selectedDay&&<BookingTimeSelection day={selectedDay} locale={locale} selectedTime={selectedTime} onTime={value=>{setSelectedTime(value);setSubmitError("");}} onBack={()=>setStep("date")} onContinue={()=>setStep("contact")} labels={b}/>}
 {step==="contact"&&<><div className="mb-6 rounded-lg bg-muted p-4"><strong>{b.summary}:</strong> {selectionLabel}</div><BookingContactForm value={contact} onChange={value=>{setContact(value);setErrors({});}} onSubmit={()=>void submit()} submitting={submitting} errors={errors} b={b} privacyPath={withLang("/datenschutz")} onBack={()=>setStep("time")}/></>}</CardContent></Card>;
}
