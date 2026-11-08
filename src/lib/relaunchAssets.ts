// PREVIEW-ONLY: Diese lokalen Medien kommen aus dem vom Nutzer gelieferten ZIP.
// Vor einem freigegebenen Supabase-Upload NICHT als produktive Medien-URLs betrachten.
// Nach Upload: Versionierte öffentliche Storage-URLs in diesem Modul eintragen.
const preview = "/preview-assets";
const existing = "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/energieassistent-io";
const legacy = "https://vibe.filesafe.space/1789758049296638029/attachments";

export const relaunchAssets = {
  // Schwarzes Logo aus demselben öffentlichen Supabase-Storage-Bucket für hellen Hintergrund.
  logo: "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/logo-schwarz-2000x2000.png",
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
  acquisition: {
    adsSequence: `${preview}/ads-system-ablauf.gif`,
    flyer: `${preview}/einwurfkarte-animation.gif`,
    flyerOriginal: `${preview}/einwurfkarte-original.png`,
  },
  caseStudies: {
    tarifbutler: `${preview}/fallstudie-tarifbutler.png`,
    ehiogie: `${preview}/fallstudie-ehiogie.png`,
  },
  founder: `${existing}/osasere-laurent.webp`,
  location: `${preview}/standort-office.png`,
} as const;
