import type { JsonRecord } from "./customerDefaults";

/**
 * Diese Datei enthält Repo-Fallback-Copy.
 * Supabase-Overrides sollen später über `webseite_content_config` gemerged werden.
 * Texte dürfen bei Architektur-Refactors nicht verändert werden.
 * Copy-Polish ist ein separater Schritt.
 */
export const customerDefaultWebsiteContentConfig: JsonRecord = {
  brand: {
    name: "Energieassistent",
    contact_email: "",
    agency_url: "https://energieassistent.io",
    agency_alt: "Powered by Energieassistent.io",
  },
  seo: {
    title: "Energieassistent",
    description: "Strom- und Gastarife sowie Jahresrechnungen verständlich prüfen.",
    site_url: "",
    image_url: "",
  },
  legal: {
    ready: false,
    variables: {
      firma: "",
      inhaber: "",
      strasse: "",
      plz: "",
      ort: "",
      land: "",
      email: "",
      telefon: "",
      stand: new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" }),
    },
  },
  i18n: {},
  integrations: {
    google_reviews: {
      jotform_widget_id: "",
    },
  },
  sections: {
    hero: {
      image_alt: "Energieassistent",
      badge: {
        de: "Bereits 1.500+ zufriedene Nutzer in ganz Deutschland",
        en: "Already 1,500+ satisfied users across Germany",
        tr: "Almanya genelinde şimdiden 1.500+ memnun kullanıcı",
        ru: "Уже более 1 500 довольных пользователей по всей Германии",
        ar: "أكثر من 1,500 مستخدم راضٍ في جميع أنحاء ألمانيا",
        it: "Già oltre 1.500 utenti soddisfatti in tutta la Germania",
        zh: "德国各地已有 1,500 多名满意用户",
        hi: "जर्मनी भर में पहले से ही 1,500+ संतुष्ट उपयोगकर्ता",
        es: "Más de 1.500 usuarios satisfechos en toda Alemania",
        fr: "Déjà plus de 1 500 utilisateurs satisfaits dans toute l’Allemagne",
        nl: "Al meer dan 1.500 tevreden gebruikers in heel Duitsland",
        pl: "Już ponad 1 500 zadowolonych użytkowników w całych Niemczech",
      },
      headline: {
        de: "Zahlst du gerade zu viel für Strom oder Gas?",
        en: "Are you currently paying too much for electricity or gas?",
        tr: "Şu anda elektrik veya gaz için fazla mı ödüyorsun?",
        ru: "Вы сейчас платите слишком много за электричество или газ?",
        ar: "هل تدفع حاليًا أكثر من اللازم مقابل الكهرباء أو الغاز؟",
        it: "Stai pagando troppo per luce o gas?",
        zh: "你现在是否为电费或燃气费支付过高？",
        hi: "क्या आप अभी बिजली या गैस के लिए ज़्यादा भुगतान कर रहे हैं?",
        es: "¿Estás pagando demasiado por electricidad o gas?",
        fr: "Payez-vous actuellement trop cher votre électricité ou votre gaz ?",
        nl: "Betaal je op dit moment te veel voor stroom of gas?",
        pl: "Czy obecnie płacisz za dużo za prąd lub gaz?",
      },
      subline: {
        de: "Finde es in nur 60 Sekunden heraus. Dein digitaler Energieassistent analysiert automatisch hunderte Tarife, filtert Lockangebote und riskante Anbieter heraus und zeigt dir eine sichere Empfehlung mit möglicher Ersparnis.",
        en: "Find out in just 60 seconds. Your digital energy assistant automatically analyzes hundreds of tariffs, filters out teaser offers and risky providers, and shows you a reliable recommendation with potential savings.",
        tr: "Sadece 60 saniyede öğren. Dijital enerji asistanın yüzlerce tarifeyi otomatik olarak analiz eder, yanıltıcı teklifleri ve riskli sağlayıcıları eler, sana da olası tasarruf sağlayabilecek güvenli bir öneri gösterir.",
        ru: "Узнайте это всего за 60 секунд. Ваш цифровой энергоассистент автоматически анализирует сотни тарифов, отсеивает заманчивые предложения и рискованных поставщиков и показывает надёжную рекомендацию с возможной экономией.",
        ar: "اكتشف ذلك خلال 60 ثانية فقط. يقوم مساعدك الرقمي للطاقة بتحليل مئات التعرفات تلقائيًا، ويستبعد العروض المضللة والمزوّدين ذوي المخاطر، ثم يعرض لك توصية آمنة مع إمكانية التوفير.",
        it: "Scoprilo in soli 60 secondi. Il tuo assistente energetico digitale analizza automaticamente centinaia di tariffe, filtra offerte civetta e fornitori rischiosi e ti mostra una raccomandazione sicura con un possibile risparmio.",
        zh: "只需 60 秒即可了解。你的数字能源助手会自动分析数百种资费方案，筛除诱导性优惠和高风险供应商，并为你提供一项安全可靠、可能帮你省钱的推荐。",
        hi: "सिर्फ 60 सेकंड में पता करें। आपका डिजिटल ऊर्जा सहायक अपने-आप सैकड़ों टैरिफ का विश्लेषण करता है, भ्रामक ऑफ़र और जोखिम वाले प्रदाताओं को फ़िल्टर करता है, और संभावित बचत के साथ एक सुरक्षित सिफारिश दिखाता है।",
        es: "Descúbrelo en solo 60 segundos. Tu asistente energético digital analiza automáticamente cientos de tarifas, filtra ofertas gancho y proveedores de riesgo, y te muestra una recomendación segura con posible ahorro.",
        fr: "Découvrez-le en seulement 60 secondes. Votre assistant énergétique numérique analyse automatiquement des centaines de tarifs, écarte les offres d’appel et les fournisseurs à risque, puis vous propose une recommandation fiable avec des économies potentielles.",
        nl: "Ontdek het in slechts 60 seconden. Je digitale energieassistent analyseert automatisch honderden tarieven, filtert lokaanbiedingen en risicovolle aanbieders eruit en toont je een veilige aanbeveling met mogelijke besparing.",
        pl: "Sprawdź to w zaledwie 60 sekund. Twój cyfrowy asystent energetyczny automatycznie analizuje setki taryf, odfiltrowuje oferty-pułapki i ryzykownych dostawców oraz pokazuje bezpieczną rekomendację z możliwą oszczędnością.",
      },
      cta_text: {
        de: "Jetzt Ersparnis prüfen",
        en: "Check your savings now",
        tr: "Tasarrufunu şimdi kontrol et",
        ru: "Проверьте возможную экономию",
        ar: "تحقق من إمكانية التوفير الآن",
        it: "Verifica ora il tuo risparmio",
        zh: "立即查看可节省金额",
        hi: "अभी अपनी बचत जांचें",
        es: "Comprueba tu ahorro ahora",
        fr: "Vérifiez vos économies maintenant",
        nl: "Controleer nu je besparing",
        pl: "Sprawdź możliwe oszczędności",
      },
      result_note: {
        de: "Ergebnis in 60 Sekunden - 100% kostenlos",
        en: "Result in 60 seconds - 100% free",
        tr: "60 saniyede sonuç - %100 ücretsiz",
        ru: "Результат за 60 секунд — 100% бесплатно",
        ar: "النتيجة خلال 60 ثانية - مجاني 100%",
        it: "Risultato in 60 secondi - 100% gratuito",
        zh: "60 秒出结果 - 100% 免费",
        hi: "60 सेकंड में परिणाम - 100% मुफ्त",
        es: "Resultado en 60 segundos - 100% gratis",
        fr: "Résultat en 60 secondes - 100 % gratuit",
        nl: "Resultaat in 60 seconden - 100% gratis",
        pl: "Wynik w 60 sekund — 100% bezpłatnie",
      },
    },
    solution: {
      image_url: "",
      image_alt: "Energieassistent",
      image_position: "left",
      headline: "Du musst den Tarifmarkt nicht selbst verstehen oder vergleichen.",
      body: "Dein digitaler Energieassistent übernimmt das für dich! Finde in 60 Sekunden heraus, ob du aktuell zu viel zahlst.",
      cta_text: "Jetzt Ersparnis prüfen",
      result_note: "Ergebnis in 60 Sekunden - 100% kostenlos",
    },
    about: {
      mode: "company",
      headline: "Über den Energieassistenten",
      image_url: "",
      image_alt: "",
      name: "Energieassistent",
      role: "",
      social_hint: "",
      social: { youtube: "", facebook: "", tiktok: "", instagram: "" },
      paragraph_1: "Der digitale Energieassistent unterstützt Haushalte dabei, Strom- und Gastarife sowie Jahresrechnungen verständlich zu prüfen.",
      paragraph_2: "So wird aus einem komplizierten Tarifvergleich oder einer schwer verständlichen Jahresrechnung eine einfache Entscheidung.",
      paragraph_3: "",
      paragraph_4: "",
      paragraph_5: "",
      paragraph_6: "",
    },
    how_it_works: {
      headline: "So einfach funktioniert’s",
      cta_text: "Jetzt Ersparnis prüfen",
      items: [
        { title: "Ersparnisprüfung starten", description: "Klicke dich einfach durch ein paar kurze Fragen zu deinem Tarif und Haushalt, damit der Energieassistent deine Situation prüfen kann." },
        { title: "Automatische Analyse", description: "Der Energieassistent analysiert mithilfe von KI verfügbare Tarife in deiner Region und filtert Lockangebote, riskante Anbieter sowie versteckte Vertragsfallen für dich heraus." },
        { title: "Tarifempfehlung erhalten", description: "Statt einer langen Tarifliste erhältst du eine sichere Empfehlung mit möglicher Ersparnis inklusive Erklärung, warum dieser Tarif eine sichere Wahl ist." },
        { title: "Wechsel & Tarifüberwachung", description: "Wenn dir der empfohlene Tarif zusagt, übernimmt der Energieassistent den Wechsel für dich, überwacht deine Kündigungsfristen und meldet sich automatisch, sobald ein erneuter Wechsel sinnvoll ist." }
      ],
    },
    problem: {
      headline: "Warum die meisten Haushalte unnötig zu viel für Strom oder Gas zahlen",
      items: [
        { title: "Viele prüfen ihren Tarif jahrelang nicht", description: "Wer seinen Tarif lange nicht überprüft, zahlt oft deutlich mehr als nötig, weil sich Preise und Angebote ständig verändern.", iconKey: "calendar" },
        { title: "Viele glauben, ihr Tarif sei bereits günstig", description: "Ein Tarif, der früher gut war, kann heute längst nicht mehr optimal sein. Ohne Prüfung merkt man das oft nicht.", iconKey: "coins" },
        { title: "Viele bleiben beim Grundversorger", description: "In vielen Regionen ist die Grundversorgung deutlich teurer als alternative Tarife. Trotzdem bleiben viele Haushalte dort oft aus Gewohnheit oder Unwissen.", iconKey: "building" },
        { title: "Der Tarifmarkt wirkt kompliziert", description: "Hunderte Angebote mit unterschiedlichen Bedingungen machen es schwer zu erkennen, welcher Tarif wirklich gut ist deshalb lassen viele ihren Tarif einfach unverändert.", iconKey: "search" }
      ],
    },
    comparison: {
      headline: "Der Unterschied: Digitaler Energieassistent vs. klassische Vergleichsportale",
      portals_title: "Mit Vergleichsportalen",
      assistant_title: "Mit Energieassistent",
      portals: [
        "Du vergleichst hunderte Tarife mühsam selbst und bist am Ende unsicher als vorher",
        "Du musst Lockangebote, Bonus-Tricks und versteckte Kosten selbst erkennen",
        "Du musst selbst prüfen, ob Anbieter stabil oder risikoreich sind",
        "Du erhältst viele Optionen, aber keine klare Empfehlung",
        "Nach dem Wechsel bist du auf dich gestellt keine Erinnerung oder Betreuung"
      ],
      assistant: [
        "Der Energieassistent filtert hunderte Tarife für dich du bekommst eine klare, sichere Empfehlung",
        "Lockangebote, Boni-Tricks und versteckte Kosten werden automatisch für dich ausgeschlossen",
        "Der Energieassistent prüft Anbieter auf Stabilität und Risiko du bekommst nur sichere Anbieter",
        "Du bekommst eine geprüfte Empfehlung statt endlose Listen kein Vergleichen, keine Unsicherheit",
        "Der Energieassistent bleibt für dich aktiv überwacht Fristen und meldet sich automatisch mit Empfehlungen"
      ],
      cta_text: "Jetzt Ersparnis prüfen",
    },
    final_cta: {
      headline: "Jedes Jahr verschenken Millionen Haushalte bis zu 1.500 € an ihren Energieanbieter",
      subline: "Prüfe in nur 60 Sekunden, ob und wie viel du aktuell sparen könntest.",
      cta_text: "Jetzt Ersparnis prüfen",
    },
    callback: {
      title: "Rückruf anfordern",
      description: "Wähle einen passenden Termin für deinen Rückruf aus.",
      calendar_url: "",
      disabled_text: "Der Rückruf-Kalender wird gerade vorbereitet. Bitte nutze vorübergehend die Kontaktmöglichkeiten auf der Webseite.",
    },
    links: {
      website: "/",
      datenschutz: "/datenschutz",
      impressum: "/impressum",
      tarif: "/tarif",
      jahresrechnung: "/jahresrechnung",
      auftrag_eingegangen: "/auftrag-eingegangen",
      rechnung_eingegangen: "/rechnung-eingegangen",
      fehler: "/fehler",
      rechnung_fehler: "/rechnung-fehler",
    },
    testimonials: {
      kicker: "Das sagen unsere Nutzer",
      headline: "Über 1500 Haushalte nutzen bereits den digitalen Energieassistenten",
      home_reviews: [
        { title: "Ich hatte ehrlich gesagt keine...", text: "Ich hatte ehrlich gesagt keine Lust, mich durch hunderte Stromtarife zu wühlen. Der Energieassistent hat mir in weniger als einer Minute eine klare Empfehlung gezeigt. Ich spare jetzt über 200 € im Jahr und musste mich um nichts kümmern.", name: "Manfred Z." },
        { title: "Ich dachte immer, mein Tarif...", text: "Ich dachte immer, mein Tarif wäre schon günstig. Nach der Prüfung habe ich gesehen, dass ich deutlich zu viel zahle. Der Wechsel war super einfach und ohne Probleme.", name: "Burak H." },
        { title: "Ich habe mich vorher...", text: "Ich habe mich vorher nie getraut zu wechseln, weil ich Angst hatte, einen schlechten Anbieter zu erwischen oder irgendeinen Haken zu übersehen. Der Energieassistent hat mir nicht einfach eine Liste gezeigt, sondern eine klare Empfehlung mit Erklärung. Dadurch hatte ich zum ersten Mal das Gefühl, wirklich eine sichere Entscheidung zu treffen.", name: "Sonja G." },
      ],
    },
    jahresrechnung: {
      reviews: [
        { title: "Ich fand gut, dass...", text: "Ich fand gut, dass die Ergebnisse verständlich erklärt wurden. Gerade bei den ganzen Zahlen auf der Rechnung verliert man sonst schnell den Überblick.", name: "Anja L." },
        { title: "Ich lasse meine...", text: "Ich lasse meine Rechnungen jetzt wahrscheinlich jedes Jahr prüfen. Gerade bei den Preisen momentan ist es gut zu wissen, ob alles stimmt.", name: "Ben U." },
        { title: "Ich habe einfach...", text: "Ich habe einfach meine Rechnung hochgeladen und kurz darauf eine verständliche Auswertung bekommen. Fand ich super praktisch, weil ich bei diesen Rechnungen sonst überhaupt nicht durchblicke.", name: "Markus R." },
      ],
    },
    stats: {
      headline: "Über 1.500 Haushalte nutzen bereits den digitalen Energieassistenten",
      items: [
        { end: 10000, suffix: "+", label: "Tarife und Rechnungen bereits geprüft" },
        { end: 1500, suffix: "+", label: "Haushalte nutzen den Energieassistenten" },
        { end: 600000, suffix: "+ €", label: "an Energiekosten bereits eingespart" },
      ],
    },
    faq: {
      home_items: [
        {
          question: "Wie funktioniert die Tarifprüfung genau?",
          answer:
            "Der Energieassistent analysiert deine aktuellen Tarifdaten und vergleicht diese automatisch mit hunderten verfügbaren Angeboten auf dem Markt. Dabei werden Lockangebote und riskante Anbieter direkt herausgefiltert.",
        },
        {
          question: "Welche Aufgaben übernimmt der Energieassistent für mich?",
          answer:
            "Wir überwachen deine Kündigungsfristen, prüfen regelmäßig den Markt auf bessere Angebote und übernehmen den kompletten Wechselprozess für dich, sobald ein neuer Tarif sinnvoll ist.",
        },
        {
          question: "Ist die Tarifprüfung wirklich kostenlos?",
          answer: "Ja, die Prüfung deiner aktuellen Situation und die erste Empfehlung sind komplett kostenlos und unverbindlich.",
        },
        {
          question: "Sind meine Daten bei der Prüfung sicher?",
          answer:
            "Absolut. Wir legen höchsten Wert auf Datenschutz und verarbeiten deine Angaben ausschließlich verschlüsselt nach den aktuellen DSGVO-Richtlinien.",
        },
        {
          question: "Kann es beim Wechsel zu einer Unterbrechung der Versorgung kommen?",
          answer: "Nein, eine Unterbrechung der Strom- oder Gasversorgung ist gesetzlich ausgeschlossen. Der Wechsel verläuft für dich nahtlos im Hintergrund.",
        },
        {
          question: "An wen kann ich mich wenden, wenn ich Fragen habe?",
          answer:
            "Unser Kundenservice steht dir jederzeit per E-Mail oder telefonisch zur Verfügung. Die Kontaktdaten findest du im Fußbereich dieser Seite.",
        },
      ],
    },
  },
};
