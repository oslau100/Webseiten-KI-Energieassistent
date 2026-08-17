export const affiliateCopy = {
  de: {
    program: "Empfehlungsprogramm", login: "Anmelden", register: "Konto erstellen", logout: "Abmelden",
    landingTitle: "Kromen weiterempfehlen – ganz einfach", landingBody: "Teile Kromens Energie-Service mit Menschen, denen du helfen möchtest. Nach der Registrierung erhältst du deinen persönlichen Empfehlungslink.",
    rewardNote: "Wenn aus einer Empfehlung ein bestätigter Abschluss wird, kann dafür die im Programm angezeigte Belohnung verfügbar werden.",
    howTitle: "So funktioniert es", step1: "Kostenlos registrieren", step2: "Persönlichen Link teilen", step3: "Status transparent verfolgen",
    name: "Name", email: "E-Mail-Adresse", password: "Passwort", passwordAgain: "Passwort wiederholen", consent: "Ich akzeptiere die Teilnahmebedingungen und habe die Datenschutzhinweise gelesen.",
    forgot: "Passwort vergessen?", noAccount: "Noch kein Konto?", haveAccount: "Du hast bereits ein Konto?", neutralError: "Das hat leider nicht funktioniert. Bitte versuche es später erneut.",
    forgotTitle: "Passwort zurücksetzen", forgotBody: "Gib deine E-Mail-Adresse ein. Falls ein Konto besteht, senden wir dir einen Link.", sendLink: "Link anfordern", sentTitle: "E-Mail unterwegs", sentBody: "Prüfe dein Postfach und gegebenenfalls den Spam-Ordner.",
    resetTitle: "Neues Passwort festlegen", savePassword: "Passwort speichern", invalidLink: "Dieser Link ist ungültig oder abgelaufen.", resetSuccess: "Dein Passwort wurde geändert.", activation: "Konto aktivieren", activationLoading: "Aktivierung wird geprüft …", activationSuccess: "Dein Konto ist jetzt aktiviert.",
    dashboard: "Übersicht", referrals: "Empfehlungen", rewards: "Belohnungen", profile: "Profil", hello: "Dein Empfehlungsprogramm", programSummary: "Aktuelles Programm", programUnavailable: "Programmdetails sind zurzeit nicht verfügbar.",
    referralLink: "Dein Empfehlungslink", copy: "Kopieren", copied: "Kopiert", linkLanguage: "Sprache des Links", share: "Teilen", unavailable: "Noch keine Daten verfügbar", unavailableBody: "Sobald die sichere Verbindung zum Portal verfügbar ist, werden deine Daten hier angezeigt.",
    clicks: "Link-Klicks", recommendations: "Tarifempfehlungen", closes: "Abschlüsse", confirmed: "Bestätigte Abschlüsse", pendingMoney: "Ausstehend", payable: "Auszahlbar", paidMoney: "Ausgezahlt",
    status: "Status", person: "Empfehlung", date: "Erfasst am", lifecycle: "Letzter Stand", reward: "Belohnung", noReferrals: "Noch keine Empfehlungen vorhanden.", noRewards: "Noch keine Belohnungen vorhanden.",
    pending: "Ausstehend", available: "Verfügbar", paid: "Ausgezahlt", cancelled: "Storniert", attributed: "Zugeordnet", recommended: "Tarif empfohlen", closed: "Abgeschlossen", confirmedStatus: "Bestätigt",
    method: "Auszahlungsart", amount: "Betrag", created: "Erstellt", availableDate: "Verfügbar ab", paidDate: "Ausgezahlt am", identity: "Persönliche Angaben", security: "Konto & Sicherheit", changePassword: "Passwort ändern", payout: "Auszahlung", payoutBody: "Eine Auszahlungsart ist noch nicht hinterlegt.", backHome: "Zur Kromen Website",
  },
} as const;

export type AffiliateCopyKey = keyof typeof affiliateCopy.de;

export const getAffiliateCopy = (lang: string, key: AffiliateCopyKey) => {
  // German is deliberately authoritative until reviewed portal translations are supplied.
  return affiliateCopy.de[key];
};
