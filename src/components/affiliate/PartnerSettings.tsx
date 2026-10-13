import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { AffiliatePayoutMethod, AffiliateProfile } from "@/lib/affiliate-api";
import { formatDate, safeMaskedIban } from "@/lib/affiliate-presentation";
import { maskIban, validateIban } from "@/lib/iban";

const card = "min-w-0 rounded-[2rem] border bg-white p-6 shadow-sm";
const dialog = "max-w-[calc(100vw-2rem)] rounded-[2rem] max-h-[calc(100dvh-2rem)] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] motion-reduce:animate-none [&>button]:h-11 [&>button]:w-11 [&>button]:right-1 [&>button]:top-1";
const action = "min-h-11 rounded-full whitespace-normal";

// QA-ready only: do not mount in the runtime portal until an authoritative
// participation-policy DTO exists. This is not a payout method.
export function NoRemunerationCard() {
  return <section className={card}><h2 className="text-xl font-bold">Ohne Belohnung</h2><p className="mt-4 text-sm text-muted-foreground">Für deine Teilnahme sind keine Belohnungen vorgesehen. Deine Empfehlungen bleiben hier sichtbar.</p></section>;
}

export function BankDetailsDialog({ hasBank }: { hasBank: boolean }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" className={`mt-4 ${action}`}>{hasBank ? "Bankverbindung ändern" : "Bankverbindung hinterlegen"}</Button></DialogTrigger>
    <DialogContent className={dialog}>
      <DialogTitle className="pr-7">{hasBank ? "Bankverbindung ändern" : "Bankverbindung hinterlegen"}</DialogTitle>
      <DialogDescription>Prüfe das Format deiner Bankverbindung. Diese Eingabe wird nicht gespeichert.</DialogDescription>
      {open && <BankForm onClose={() => setOpen(false)} />}
    </DialogContent>
  </Dialog>;
}

function BankForm({ onClose }: { onClose: () => void }) {
  const [owner, setOwner] = useState("");
  const [raw, setRaw] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [masked, setMasked] = useState<string>();
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState(false);
  const validation = validateIban(raw);
  const finishEditing = () => {
    const result = validateIban(raw);
    setMasked(maskIban(raw));
    setMessage(result.message);
    setInvalid(result.status !== "valid");
    if (inputRef.current) inputRef.current.value = "";
    setRaw("");
  };
  return <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (raw) finishEditing(); }}>
    <label className="block text-sm font-semibold">Kontoinhaber<Input value={owner} onChange={event => setOwner(event.target.value)} autoComplete="off" maxLength={120} className="mt-2 h-12 rounded-2xl" required /></label>
    {masked ? <div className="space-y-2"><p className="text-sm font-semibold">IBAN</p><p>{masked}</p><Button type="button" variant="outline" className={action} onClick={() => { setMasked(undefined); setMessage(""); setInvalid(false); }}>IBAN erneut eingeben</Button></div> :
      <label className="block text-sm font-semibold">IBAN<Input ref={inputRef} defaultValue="" onChange={event => { setRaw(event.target.value); setMessage(""); setInvalid(false); }} onBlur={finishEditing} autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={64} aria-invalid={invalid || (raw.length > 0 && validation.status === "invalid")} aria-describedby="iban-check iban-hint" className="mt-2 h-12 rounded-2xl" /></label>}
    <p id="iban-check" role="status" aria-live="polite" className={`text-sm ${invalid ? "text-red-800" : "text-muted-foreground"}`}>{raw ? validation.message : message}</p>
    <p id="iban-hint" className="text-sm text-muted-foreground">Nur eine formale Prüfung. Sie bestätigt weder das Konto noch die Kontoinhaberschaft.</p>
    <div className="flex flex-wrap gap-3"><Button type="submit" variant="outline" className={action} disabled={!owner.trim() || (!raw && !masked)}>Format prüfen</Button><Button type="button" disabled className={action} aria-describedby="bank-save-hint">Speichern</Button><Button type="button" variant="outline" className={action} onClick={onClose}>Abbrechen</Button></div>
    <p id="bank-save-hint" className="text-sm text-muted-foreground">Deine Eingabe wird nicht gespeichert.</p>
  </form>;
}

export function PayoutMethodCard({ method }: { method: AffiliatePayoutMethod | null }) {
  const masked = safeMaskedIban(method?.maskedIban);
  return <section className={card}><h2 className="text-xl font-bold">Auszahlungsmethode</h2>
    {method?.method === "gift_card" ? <><p className="mt-4 font-semibold">Gutschein</p><p className="mt-2 text-sm text-muted-foreground">Deine Gutscheine werden an die E-Mail-Adresse deines Partnerkontos gesendet.</p></> : method?.method === "bank_transfer" ? <><p className="mt-4 font-semibold">Banküberweisung</p><p className="mt-2 text-muted-foreground">{masked || "Noch nicht hinterlegt"}</p><BankDetailsDialog hasBank={Boolean(masked)} /></> : <><p className="mt-4 text-muted-foreground">{method ? "Die Auszahlungsmethode ist noch nicht bekannt." : "Noch nicht hinterlegt"}</p><p className="mt-2 text-sm text-muted-foreground">Deine Auszahlungsmethode wird hier angezeigt, sobald sie feststeht.</p></>}
  </section>;
}

export function ProfileCard({ profile }: { profile: AffiliateProfile }) {
  const [open, setOpen] = useState(false);
  return <section className={card}><h2 className="text-xl font-bold">Konto & Profil</h2><p className="mt-4 break-words">{profile.firstName} {profile.lastName}</p><p className="text-sm text-muted-foreground">Mitglied seit {formatDate(profile.memberSince)}</p>
    <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className={`mt-4 ${action}`}>Kontodaten ändern</Button></DialogTrigger><DialogContent className={dialog}><DialogTitle className="pr-7">Kontodaten ändern</DialogTitle><DialogDescription>Prüfe deine Angaben. Änderungen werden hier nicht gespeichert.</DialogDescription>{open && <ProfileForm profile={profile} onClose={() => setOpen(false)} />}</DialogContent></Dialog>
  </section>;
}
function ProfileForm({ profile, onClose }: { profile: AffiliateProfile; onClose: () => void }) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const valid = Boolean(firstName.trim() && lastName.trim());
  return <form className="space-y-4" onSubmit={event => event.preventDefault()}>
    <label className="block text-sm font-semibold">Vorname<Input required value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={100} className="mt-2 h-12 rounded-2xl" autoComplete="given-name" aria-invalid={!firstName.trim()} /></label>
    <label className="block text-sm font-semibold">Nachname<Input required value={lastName} onChange={event => setLastName(event.target.value)} maxLength={100} className="mt-2 h-12 rounded-2xl" autoComplete="family-name" aria-invalid={!lastName.trim()} /></label>
    {!valid && <p role="status" className="text-sm text-red-800">Bitte fülle Vorname und Nachname aus.</p>}
    <p id="profile-save-hint" className="text-sm text-muted-foreground">Deine Änderungen werden nicht gespeichert.</p><div className="flex flex-wrap gap-3"><Button disabled type="button" className={action} aria-describedby="profile-save-hint">Speichern</Button><Button type="button" variant="outline" className={action} onClick={onClose}>Abbrechen</Button></div>
  </form>;
}
