import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { type SigningManifest, type UnavailableReason, parseSigningManifest, verifyPrivatePdf } from "@/lib/signing/contract";
import type { SigningBrand } from "@/lib/signing/brand";
import { captureKey, changeDrawing, emptySigningDraft, participantComplete, requiredReviewComplete } from "@/lib/signing/presentation";
import { SignaturePad } from "./SignaturePad";

/** Presentation props are NOT session credentials. The public route never supplies review data.
 * Synthetic presentations are mounted only by isolated tests, not a preview URL or browser flag.
 */
export type SigningPresentation = { status: "loading" } |
  { status: "unavailable"; reason: UnavailableReason } |
  { status: "review"; manifest: SigningManifest; pdf: Blob; brand: SigningBrand };

function Unavailable({ reason }: { reason: UnavailableReason }) {
  const { t } = useI18n();
  const key = reason === "expired" ? "expired" : ["superseded", "invalidated"].includes(reason) ? "updated" :
    ["failed", "pdf_missing"].includes(reason) ? "failed" : "unavailable";
  return <div role="status" className="rounded-xl border bg-muted p-6"><h2 className="text-xl font-semibold">{t("signing_unavailable")}</h2>
    {key !== "unavailable" && <p className="mt-3">{t(`signing_${key}`)}</p>}</div>;
}

export function SigningShell({ state }: { state: SigningPresentation }) {
  const { t, lang, setLang, withLang } = useI18n();
  const languageId = useId();
  const parsed = state.status === "review" ? parseSigningManifest(state.manifest) : null;
  const valid = state.status === "review" && parsed && state.brand?.key === state.manifest.brand;
  const brand = valid && state.status === "review" ? state.brand : null;
  return <div className="min-h-screen bg-background text-foreground flex flex-col notranslate" translate="no"
    lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} style={brand?.tokens as CSSProperties} data-signing-shell data-no-translate="true">
    <header className="border-b"><div className="container max-w-7xl px-4 py-5 flex flex-wrap items-center justify-between gap-4">
      {brand && <img src={brand.logo} alt={brand.name} className="h-16 max-w-[180px] object-contain" />}
      <div className="flex flex-wrap items-center gap-2"><label htmlFor={languageId}>{t("signing_language")}</label>
        <select id={languageId} value={lang} onChange={e => setLang(e.target.value as typeof lang)} className="min-h-11 rounded-md border bg-background p-2">
          {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.label}</option>)}
        </select></div>
    </div></header>
    <main className="container max-w-7xl flex-1 px-4 py-8 md:py-12 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">{t("signing_title")}</h1>
      {state.status === "loading" ? <p role="status" aria-busy="true">{t("signing_loading")}</p> :
        state.status === "unavailable" ? <Unavailable reason={state.reason} /> : !valid ? <Unavailable reason="unauthorized" /> :
          <Review key={JSON.stringify(state.manifest)}
            manifest={state.manifest} pdf={state.pdf} />}
    </main>
    {brand && <footer className="border-t"><div className="container max-w-7xl px-4 py-6 flex flex-wrap gap-5 text-sm">
      <span>{brand.name}</span><a className="underline" href={`mailto:${brand.supportEmail}`}>{t("signing_support")}</a>
      <Link className="underline" to={withLang("/datenschutz")}>{t("signing_privacy")}</Link>
      <Link className="underline" to={withLang("/impressum")}>{t("signing_imprint")}</Link>
    </div></footer>}
  </div>;
}

function Review({ manifest, pdf }: { manifest: SigningManifest; pdf: Blob }) {
  const { t } = useI18n();
  const [document, setDocument] = useState<{ blob: Blob; url: string } | null>(null);
  const [failure, setFailure] = useState<UnavailableReason | null>(null);
  const [expired, setExpired] = useState(Date.parse(manifest.expiresAt) <= Date.now());
  const [zoom, setZoom] = useState(100);
  const [draft, setDraft] = useState(emptySigningDraft);
  const [participantId, setParticipantId] = useState(manifest.participants[0].id);
  const [finished, setFinished] = useState(false);
  const [handOver, setHandOver] = useState<string | null>(null);
  const reviewId = useId();
  const personHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { personHeading.current?.focus(); }, [participantId, handOver]);
  const participant = manifest.participants.find(p => p.id === participantId)!;
  const requirements = manifest.requirements.filter(r => r.participantId === participant.id);
  const groups = requirements.filter((r, i, all) => all.findIndex(other => captureKey(other) === captureKey(r)) === i);
  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    setDocument(null); setFailure(null); setDraft(emptySigningDraft()); setFinished(false);
    void verifyPrivatePdf(pdf, manifest.document.sha256).then(valid => {
      if (cancelled) return;
      if (!valid) { setFailure("pdf_missing"); return; }
      try { url = URL.createObjectURL(pdf); setDocument({ blob: pdf, url }); }
      catch { setFailure("failed"); }
    });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [pdf, manifest.document.sha256]);
  useEffect(() => {
    const check = () => {
      if (Date.parse(manifest.expiresAt) <= Date.now()) {
        setExpired(true); setDraft(emptySigningDraft());
      }
    };
    check();
    const timer = window.setInterval(check, 1000);
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", check); window.removeEventListener("pageshow", check); };
  }, [manifest.expiresAt]);
  // An expiration/error unmounts capture and PDF immediately. Object URLs are revoked as well.
  useEffect(() => {
    if ((expired || failure) && document) { URL.revokeObjectURL(document.url); setDocument(null); setDraft(emptySigningDraft()); }
  }, [expired, failure, document]);
  if (expired || failure) return <Unavailable reason={expired ? "expired" : failure!} />;
  if (!document || document.blob !== pdf) return <p role="status" aria-busy="true">{t("signing_loading")}</p>;
  const complete = requiredReviewComplete(manifest, draft);
  return <>
    {manifest.mode === "TEST_ONLY" && <p className="font-bold rounded-lg border-2 border-amber-600 p-3">DEMO / TEST_ONLY</p>}
    <p className="max-w-3xl text-muted-foreground">{t("signing_intro")}</p>
    <p className="rounded-lg border p-4" role="note">{t("signing_locked")}</p>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] items-start">
      <Card className="min-w-0"><CardHeader><CardTitle>{t("signing_document")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("signing_original")}</p></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" onClick={() => setZoom(z => Math.max(50, z - 25))} disabled={zoom === 50} aria-label={t("signing_zoomOut")}>−</Button>
            <output aria-live="polite">{zoom}%</output>
            <Button variant="outline" onClick={() => setZoom(z => Math.min(200, z + 25))} disabled={zoom === 200} aria-label={t("signing_zoomIn")}>+</Button>
            <a href={document.url} target="_blank" rel="noopener noreferrer" className="underline p-2">{t("signing_openPdf")}</a>
          </div>
          <iframe title={t("signing_document")} src={`${document.url}#zoom=${zoom}`} referrerPolicy="no-referrer"
            className="w-full h-[55vh] min-h-[300px] lg:h-[70vh] rounded-md border bg-muted" onError={() => setFailure("pdf_missing")} />
          <p className="text-sm text-muted-foreground">{t("signing_pdfProblem")}</p>
        </CardContent>
      </Card>
      <Card className="min-w-0"><CardHeader><CardTitle>{t("signing_declarations")}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {manifest.participants.length > 1 && <div className="space-y-3">
            <p>{t("signing_handover")}</p>
            <div className="flex flex-wrap gap-2">{manifest.participants.map(p => <Button key={p.id} variant={p.id === participantId ? "default" : "outline"}
              aria-pressed={p.id === participantId} onClick={() => { if (p.id !== participantId) { setHandOver(p.id); setFinished(false); } }}>
              {p.displayName} · {t(`signing_${p.role}`)}
            </Button>)}</div>
          </div>}
          {handOver ? <section role="status" className="space-y-4">
            <p>{t("signing_handover")}</p>
            <Button onClick={() => { setParticipantId(handOver); setHandOver(null); }}>
              {manifest.participants.find(p => p.id === handOver)?.displayName} · {t("signing_takeOver")}
            </Button>
          </section> : <div key={participantId} className="space-y-6">
            <h2 ref={personHeading} tabIndex={-1} className="text-xl font-semibold break-words">{participant.displayName} · {t(`signing_${participant.role}`)}</h2>
            <label htmlFor={reviewId} className="flex items-start gap-3 cursor-pointer py-2"><input id={reviewId} type="checkbox" className="mt-1 h-5 w-5 shrink-0"
              checked={draft.reviewed[participant.id] === true} onChange={event => { setFinished(false); setDraft({ ...draft, reviewed: { ...draft.reviewed, [participant.id]: event.target.checked } }); }} />
              {t("signing_review")}</label>
            {groups.map(group => <fieldset key={captureKey(group)} className="space-y-3 min-w-0">
              <legend className="font-semibold">{t("signing_signature")}{group.capture === "separate" && <> · <span lang={group.textLanguage}>{group.text}</span></>}</legend>
              <SignaturePad label={`${t("signing_signature")} · ${participant.displayName}`} strokes={draft.strokes[captureKey(group)] || []}
                onChange={strokes => { setFinished(false); setDraft(current => changeDrawing(manifest, current, captureKey(group), strokes)); }} />
            </fieldset>)}
            <fieldset className="space-y-4"><legend className="font-semibold mb-3">{t("signing_declarations")}</legend>
              {requirements.map(requirement => <label key={requirement.id} className="flex gap-3 items-start cursor-pointer rounded-lg border p-3">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={draft.confirmations[requirement.id] === true}
                  onChange={event => { setFinished(false); setDraft({ ...draft, confirmations: { ...draft.confirmations, [requirement.id]: event.target.checked } }); }} />
                <span className="min-w-0 break-words"><span lang={requirement.textLanguage} dir="auto" translate="no">{requirement.text}</span>
                  <small className="block text-muted-foreground">{t(requirement.required ? "signing_required" : "signing_optional")}</small></span>
              </label>)}
            </fieldset>
            <Button className="w-full h-auto min-h-11 whitespace-normal" disabled={!participantComplete(manifest, draft, participant.id)} onClick={() => setFinished(true)}>{t("signing_continue")}</Button>
          </div>}
          {finished && <p role="status">{t(complete ? "signing_complete" : "signing_handover")}</p>}
          <Button className="w-full h-auto min-h-11 whitespace-normal" disabled aria-describedby="signing-submit-lock">{t("signing_title")}</Button>
          <p id="signing-submit-lock" className="text-sm text-muted-foreground">{t("signing_locked")}</p>
        </CardContent>
      </Card>
    </div>
  </>;
}
