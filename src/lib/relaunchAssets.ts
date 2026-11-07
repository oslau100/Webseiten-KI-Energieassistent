// PREVIEW-ONLY: Diese lokalen Medien kommen aus dem vom Nutzer gelieferten ZIP.
// Vor einem freigegebenen Supabase-Upload NICHT als produktive Medien-URLs betrachten.
// Nach Upload: Versionierte öffentliche Storage-URLs in diesem Modul eintragen.
const preview = "/preview-assets";
const existing = "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/energieassistent-io";
const legacy = "https://vibe.filesafe.space/1789758049296638029/attachments";

export const relaunchAssets = {
  // Zwei Originale fehlen im ZIP; Vibe-Fallbacks sind noch Produktions-Blocker.
  logo: `${legacy}/838e42f7-e65c-4677-b7b8-452936eb11f7.png`,
  demoConsultant: `${legacy}/0dddc73e-3f7c-4c97-a063-19888cc99021.png`,
  heroSocialProof: `${preview}/hero-social-proof.png`,
  ads: {
    library: `${preview}/anzeigen-bibliothek.gif`,
    settings: `${preview}/kampagnen-einstellungen.gif`,
    connect: `${preview}/werbekonten-verbinden.gif`,
  },
  funnel: {
    check: `${preview}/tarifpruefung.gif`,
    recommendation: `${preview}/tarifempfehlung.gif`,
    advice: `${preview}/beratung.gif`,
    signing: `${preview}/abschluss.gif`,
  },
  crm: `${preview}/crm-aktivitaeten.gif`,
  partner: `${preview}/partnerprogramm.gif`,
  caseStudies: {
    tarifbutler: `${preview}/fallstudie-tarifbutler.png`,
    // Kromen fehlt im Liefer-ZIP: vorhandenes Supabase-Bild als vorläufiges Preview.
    kromen: `${existing}/fallstudie-kromen.webp`,
    ehiogie: `${preview}/fallstudie-ehiogie.png`,
  },
  founder: `${existing}/osasere-laurent.webp`,
  location: `${preview}/standort-office.png`,
} as const;
