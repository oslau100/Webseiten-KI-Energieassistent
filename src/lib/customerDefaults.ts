export type JsonRecord = Record<string, unknown>;

/**
 * Projektweite Core-Defaults.
 *
 * Für neue Kunden nur diese Datei anpassen/duplizieren,
 * damit die Seite ohne Supabase bereits möglichst nah am Ziel-Content läuft.
 */
export const customerDefaultWebsiteDesignConfig: JsonRecord = {
  colors: {
    primary: "#2563eb",
    text: "#0f172a",
    mutedText: "#64748b",
    background: "#ffffff",
  },
  radius: {
    section: "2.5rem",
  },
  assets: {
    logo_header: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69fb93b70394c985036ed4ae.png",
    logo_footer: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69fb93b70394c985036ed4ae.png",
    hero_image: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fcc217d86ef0ca1836e6.png",
    agency_logo: "https://assets.cdn.filesafe.space/1774643086282323006/media/a629d547-6056-4079-8549-0a910a7eafbd.png",
  },
};

export const customerDefaultWebsiteLayoutConfig: JsonRecord = {
  pages: {
    home: {
      sections: ["header", "hero", "problem", "solution", "how_it_works", "comparison", "testimonials", "about", "stats", "faq", "footer"],
    },
    annual: {
      sections: ["header", "hero", "process", "why", "value", "comparison", "testimonials", "about", "stats", "faq", "final_cta", "footer"],
    },
  },
};

export const customerDefaultWebsiteContentConfig: JsonRecord = {
  brand: {
    name: "Ehiogie Energieassistent",
    contact_email: "marvin@ehiogie-energieassistent.de",
    agency_url: "https://www.laurent-digital.de",
    agency_alt: "Made by Laurent Digital",
  },
  legal: {
    variables: {
      firma: "Ehiogie Energieassistent",
      inhaber: "Marvin Ehiogie",
      strasse: "Vaalser Str. 304B",
      plz: "52074",
      ort: "Aachen",
      land: "Deutschland",
      email: "marvin@ehiogie-energieassistent.de",
      telefon: "015213603777",
      stand: new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" }),
    },
  },
  i18n: {},
  sections: {
    hero: {
      image_alt: "Energieassistent",
      badge: {
        de: "Bereits 1.500+ zufriedene Nutzer in ganz Deutschland",
        en: "Already 1,500+ satisfied users across Germany",
        tr: "Almanya genelinde şimdiden 1.500+ memnun kullanıcı",
        ru: "Уже 1 500+ довольных пользователей по всей Германии",
        ar: "أكثر من 1,500 مستخدم راضٍ بالفعل في جميع أنحاء ألمانيا",
        it: "Oltre 1.500 utenti soddisfatti in tutta la Germania",
        zh: "德国各地已有 1,500+ 位满意用户",
        hi: "जर्मनी भर में 1,500+ संतुष्ट उपयोगकर्ता पहले से",
        es: "Más de 1.500 usuarios satisfechos en toda Alemania",
        fr: "Déjà plus de 1 500 utilisateurs satisfaits dans toute l’Allemagne",
        nl: "Al meer dan 1.500 tevreden gebruikers in heel Duitsland",
        pl: "Już ponad 1 500 zadowolonych użytkowników w całych Niemczech",
      },
      headline: {
        de: "Zahlst du gerade zu viel für Strom oder Gas?",
        en: "Are you currently paying too much for electricity or gas?",
        tr: "Şu anda elektrik veya gaz için fazla mı ödüyorsun?",
        ru: "Платите ли вы сейчас слишком много за электричество или газ?",
        ar: "هل تدفع الآن أكثر من اللازم مقابل الكهرباء أو الغاز؟",
        it: "Stai pagando troppo per luce o gas in questo momento?",
        zh: "你现在是否为电费或燃气费支付过高？",
        hi: "क्या आप अभी बिजली या गैस के लिए ज़्यादा भुगतान कर रहे हैं?",
        es: "¿Estás pagando ahora mismo demasiado por la luz o el gas?",
        fr: "Payez-vous actuellement trop cher votre électricité ou votre gaz ?",
        nl: "Betaal je op dit moment te veel voor stroom of gas?",
        pl: "Czy teraz płacisz za dużo za prąd lub gaz?",
      },
      subline: {
        de: "Finde es in nur 60 Sekunden heraus. Dein digitaler Energieassistent analysiert automatisch hunderte Tarife, filtert Lockangebote und riskante Anbieter heraus und zeigt dir eine sichere Empfehlung mit möglicher Ersparnis.",
        en: "Find out in just 60 seconds. Your digital energy assistant automatically analyzes hundreds of tariffs, filters out teaser deals and risky providers, and shows you a safe recommendation with potential savings.",
        tr: "Sadece 60 saniyede öğren. Dijital enerji asistanın yüzlerce tarifeyi otomatik olarak analiz eder, cazip görünen ama riskli teklifleri ve riskli sağlayıcıları eler, sana da olası tasarrufla güvenli bir öneri sunar.",
        ru: "Узнайте всего за 60 секунд. Ваш цифровой энергетический помощник автоматически анализирует сотни тарифов, отсекает заманчивые, но рискованные предложения и поставщиков и показывает безопасную рекомендацию с возможной экономией.",
        ar: "اكتشف ذلك خلال 60 ثانية فقط. مساعدك الرقمي للطاقة يحلل تلقائيًا مئات التعرفات، ويستبعد العروض المغرية والمورّدين عاليي المخاطر، ثم يقدّم لك توصية آمنة مع توفير محتمل.",
        it: "Scoprilo in soli 60 secondi. Il tuo assistente energetico digitale analizza automaticamente centinaia di tariffe, elimina offerte civetta e fornitori rischiosi e ti mostra una raccomandazione sicura con possibile risparmio.",
        zh: "仅需 60 秒即可了解。你的数字能源助手会自动分析数百种资费，筛除诱导优惠和高风险供应商，并给出一条安全且可能省钱的推荐。",
        hi: "सिर्फ 60 सेकंड में पता करें। आपका डिजिटल ऊर्जा सहायक अपने-आप सैकड़ों टैरिफ का विश्लेषण करता है, लुभावने ऑफ़र और जोखिमभरे प्रदाताओं को फ़िल्टर करता है, और संभावित बचत के साथ एक सुरक्षित सिफारिश दिखाता है।",
        es: "Descúbrelo en solo 60 segundos. Tu asistente energético digital analiza automáticamente cientos de tarifas, filtra ofertas gancho y proveedores de riesgo, y te muestra una recomendación segura con posible ahorro.",
        fr: "Découvrez-le en seulement 60 secondes. Votre assistant énergétique digital analyse automatiquement des centaines de tarifs, écarte les offres d’appel et les fournisseurs risqués, puis vous propose une recommandation fiable avec des économies potentielles.",
        nl: "Ontdek het in slechts 60 seconden. Je digitale energieassistent analyseert automatisch honderden tarieven, filtert lokaanbiedingen en risicovolle aanbieders eruit en toont je een veilige aanbeveling met mogelijke besparing.",
        pl: "Sprawdź to w zaledwie 60 sekund. Twój cyfrowy asystent energii automatycznie analizuje setki taryf, odfiltrowuje oferty-pułapki i ryzykownych dostawców oraz pokazuje bezpieczną rekomendację z możliwą oszczędnością.",
      },
      cta_text: {
        de: "Jetzt Ersparnis prüfen",
        en: "Check your savings now",
        tr: "Tasarrufunu şimdi kontrol et",
        ru: "Проверьте экономию сейчас",
        ar: "تحقق من التوفير الآن",
        it: "Verifica ora il tuo risparmio",
        zh: "立即查看可节省金额",
        hi: "अभी अपनी बचत जांचें",
        es: "Comprueba tu ahorro ahora",
        fr: "Vérifiez vos économies maintenant",
        nl: "Controleer nu je besparing",
        pl: "Sprawdź oszczędności teraz",
      },
      result_note: {
        de: "Ergebnis in 60 Sekunden - 100% kostenlos",
        en: "Result in 60 seconds - 100% free",
        tr: "60 saniyede sonuç - %100 ücretsiz",
        ru: "Результат за 60 секунд - 100% бесплатно",
        ar: "النتيجة خلال 60 ثانية - مجاني 100%",
        it: "Risultato in 60 secondi - 100% gratuito",
        zh: "60 秒出结果 - 100% 免费",
        hi: "60 सेकंड में परिणाम - 100% मुफ्त",
        es: "Resultado en 60 segundos - 100% gratis",
        fr: "Résultat en 60 secondes - 100% gratuit",
        nl: "Resultaat in 60 seconden - 100% gratis",
        pl: "Wynik w 60 sekund - 100% za darmo",
      },
    },
    solution: {
      image_url: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fc9824c2b28f039a10c4.png",
      image_alt: "Energieassistent",
      image_position: "left",
      headline: "Du musst den Tarifmarkt nicht selbst verstehen oder vergleichen.",
      body: "Dein digitaler Energieassistent übernimmt das für dich! Finde in 60 Sekunden heraus, ob du aktuell zu viel zahlst.",
      cta_text: "Jetzt Ersparnis prüfen",
      result_note: "Ergebnis in 60 Sekunden - 100% kostenlos",
    },
    about: {
      avatar_url: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fc76bc1d4a17f7def171.png",
      person_name: "Marvin Ehiogie",
      role: "Experte für Strom & Gas",
      social_hint: "Folge mir auf den Sozialen Medien für Tipps rund um Strom & Gas",
      social: {
        youtube: "https://youtube.com/@marvinstromgastipps",
        facebook: "https://www.facebook.com/share/1BB2cgcqpF/",
        tiktok: "https://www.tiktok.com/@marvin.ehiogie",
        instagram: "https://www.instagram.com/marvin.ehiogie",
      },
      paragraph_1: "Ich habe mehrere Jahre bei einem Energieversorger gearbeitet und beschäftige mich seit über 8 Jahren intensiv mit dem deutschen Energiemarkt.",
      paragraph_2: "Dabei sehe ich täglich, wie unübersichtlich Strom- und Gastarife für viele Haushalte geworden sind. Tausende Angebote, komplizierte Vertragsbedingungen und Lockangebote machen es schwer zu erkennen, welcher Tarif wirklich sinnvoll ist.",
      paragraph_3: "Viele Menschen zahlen deshalb jahrelang mehr als nötig – nicht aus Bequemlichkeit, sondern weil der Markt unnötig kompliziert geworden ist. Auch bei Jahresabrechnungen ist oft unklar, ob die Kosten wirklich korrekt berechnet wurden.",
      paragraph_4: "Genau aus diesem Grund stelle ich Haushalten den digitalen Energieassistenten zur Verfügung, um Tarife und Energiekosten schnell und sicher prüfen zu können. Das System analysiert automatisch hunderte Tarife, erkennt Auffälligkeiten in Rechnungen und zeigt eine klare Empfehlung, die wirklich zu deinem Haushalt passt.",
      paragraph_5: "So wird aus einem komplizierten Tarifvergleich oder einer schwer verständlichen Jahresrechnung eine einfache Entscheidung.",
      paragraph_6: "Mein Ziel ist es, Haushalten eine einfache und sichere Möglichkeit zu geben, ihre Energiekosten zu prüfen – ohne Tarifchaos und ohne Risiko.",
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
      website: "https://www.ehiogie-energieassistent.de",
      datenschutz: "https://www.ehiogie-energieassistent.de/datenschutz",
      impressum: "https://www.ehiogie-energieassistent.de/impressum",
      tarif: "https://www.ehiogie-energieassistent.de/tarif",
      jahresrechnung: "https://www.ehiogie-energieassistent.de/jahresrechnung",
      auftrag_eingegangen: "https://www.ehiogie-energieassistent.de/auftrag-eingegangen",
      rechnung_eingegangen: "https://www.ehiogie-energieassistent.de/rechnung-eingegangen",
      fehler: "https://www.ehiogie-energieassistent.de/fehler",
      rechnung_fehler: "https://www.ehiogie-energieassistent.de/rechnung-fehler",
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
