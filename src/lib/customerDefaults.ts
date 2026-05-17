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
      headline: "Jedes Jahr verschenken Millionen Haushalte bis zu 1.500 € an ihren Energieanbieter",
      subline: "Prüfe in nur 60 Sekunden, ob und wie viel du aktuell sparen könntest.",
      cta_text: "Jetzt Ersparnis prüfen",
    },
    solution: {
      image_url: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fc9824c2b28f039a10c4.png",
      image_alt: "Energieassistent",
      image_position: "left",
      body: "Du musst den Tarifmarkt nicht selbst verstehen oder vergleichen. Dein digitaler Energieassistent übernimmt das für dich.",
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
        { end: 1500, suffix: "+", label: "Haushalte nutzen den Energieassistenten" },
        { end: 600000, suffix: "+ €", label: "An Energiekosten bereits eingespart" },
        { end: 10000, suffix: "+", label: "Tarife und Rechnungen bereits geprüft" },
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
