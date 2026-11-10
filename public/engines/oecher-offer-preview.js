/* A view of the already loaded recommendation. No network calls or order writes. */
(() => {
  const location = "uuDEvEGcyd3mMiKWKH4Z";
  const copy = {
    de: ["Prüfung abgeschlossen", "Ersparnis:", "In der Prüfung berücksichtigt:", "Kosten & Tarifdetails", "Preisgarantie & Bedingungen", "Anbieterqualität & Risiken", "Ergebnis ansehen →"],
    en: ["Assessment complete", "Savings:", "Included in the assessment:", "Costs & tariff details", "Price guarantee & terms", "Supplier quality & risks", "View result →"],
    tr: ["İnceleme tamamlandı", "Tasarruf:", "İncelemede dikkate alınanlar:", "Maliyetler ve tarife ayrıntıları", "Fiyat garantisi ve koşullar", "Tedarikçi kalitesi ve riskler", "Sonucu gör →"],
    ru: ["Проверка завершена", "Экономия:", "При проверке учтены:", "Стоимость и условия тарифа", "Гарантия цены и условия", "Качество поставщика и риски", "Посмотреть результат →"],
    ar: ["اكتملت المراجعة", "التوفير:", "ما أُخذ في الاعتبار أثناء المراجعة:", "التكاليف وتفاصيل التعرفة", "ضمان السعر والشروط", "جودة المزوّد والمخاطر", "عرض النتيجة ←"],
    it: ["Verifica completata", "Risparmio:", "Aspetti considerati nella verifica:", "Costi e dettagli della tariffa", "Garanzia di prezzo e condizioni", "Qualità del fornitore e rischi", "Visualizza il risultato →"],
    zh: ["审核已完成", "节省：", "审核中已考虑：", "费用与资费详情", "价格保证与条款", "供应商质量与风险", "查看结果 →"],
    hi: ["जाँच पूरी हुई", "बचत:", "जाँच में शामिल पहलू:", "लागत और टैरिफ विवरण", "मूल्य गारंटी और शर्तें", "प्रदाता की गुणवत्ता और जोखिम", "परिणाम देखें →"],
    es: ["Revisión completada", "Ahorro:", "Aspectos considerados en la revisión:", "Costes y detalles de la tarifa", "Garantía de precio y condiciones", "Calidad del proveedor y riesgos", "Ver resultado →"],
    fr: ["Vérification terminée", "Économies :", "Éléments pris en compte :", "Coûts et détails du tarif", "Garantie de prix et conditions", "Qualité du fournisseur et risques", "Voir le résultat →"],
    nl: ["Controle afgerond", "Besparing:", "Meegenomen in de controle:", "Kosten en tariefdetails", "Prijsgarantie en voorwaarden", "Kwaliteit van de leverancier en risico’s", "Bekijk resultaat →"],
    pl: ["Analiza zakończona", "Oszczędność:", "W analizie uwzględniono:", "Koszty i szczegóły taryfy", "Gwarancja ceny i warunki", "Jakość dostawcy i ryzyka", "Zobacz wynik →"],
  };
  const number = value => {
    if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
  };
  const savingsFor = (row, tenant) => {
    const savings = number(row?.ersparnis);
    const cost = number(row?.jahreskosten) ?? number(row?.monatsabschlag);
    return tenant === location && row?.location_id === location &&
      ["Tarif wurde berechnet", "closing_submitted"].includes(row?.status) &&
      typeof row.uuid === "string" && row.uuid.trim() &&
      typeof row.tariff_provider === "string" && row.tariff_provider.trim() &&
      typeof row.tariff_name === "string" && row.tariff_name.trim() &&
      cost != null && cost >= 0 && savings != null && savings > 0 ? savings : null;
  };
  const present = ({ row, locationId, language, perYear, onReveal }) => {
    const root = document.getElementById("tbx2026");
    const preview = document.getElementById("tbPreOffer");
    const offer = document.getElementById("tbOfferView");
    if (!root || !preview || !offer || root.dataset.viewReady) return;
    root.dataset.viewReady = "true";
    root.setAttribute("aria-busy", "false");
    const notify = stage => {
      root.dataset.offerStage = stage;
      try { window.parent.postMessage({ type: "oecher:offer-view-state", stage }, window.location.origin); } catch (_) {}
    };
    const amount = savingsFor(row, locationId);
    const key = `oecher:offer-preview:v1:${locationId}:${row.uuid}`;
    // A changed recommendation gets its own first appearance. No contact data is stored.
    const selected = row.tarif_snapshot?.selected_preisliste || {};
    const identity = JSON.stringify([row.tarif_uuid, row.tarif_id, selected.tarif_uuid, selected.tarif_id,
      row.tariff_provider, row.tariff_name, row.ersparnis, row.jahreskosten, row.monatsabschlag]);
    let saved = {};
    try { const value = JSON.parse(window.sessionStorage.getItem(key) || "{}"); if (value.identity === identity) saved = value; } catch (_) {}
    const store = patch => {
      saved = { ...saved, ...patch, identity };
      try { window.sessionStorage.setItem(key, JSON.stringify(saved)); return true; } catch (_) { return false; }
    };
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      if (amount != null) store({ viewed: true });
      preview.hidden = true;
      preview.querySelector(".preConfetti")?.remove();
      offer.hidden = false;
      notify("offer");
      onReveal();
    };
    if (amount == null || saved.viewed) { reveal(); return; }
    const lang = Object.hasOwn(copy, language) ? language : "de";
    preview.lang = lang;
    preview.dir = lang === "ar" ? "rtl" : "ltr";
    preview.querySelectorAll("[data-preview-copy]").forEach(element => {
      element.textContent = copy[lang][Number(element.dataset.previewCopy)];
    });
    const value = preview.querySelector("#tbPreSavings");
    value.textContent = new Intl.NumberFormat(lang, {
      style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2,
    }).format(amount);
    // Size against the card's available width, including localized separators and currency.
    const characters = Array.from(value.textContent.replace(/\p{Cf}/gu, "")).length;
    value.style.setProperty("--preview-amount-width", String(characters * 0.65));
    preview.querySelector("#tbPreYear").textContent = perYear;
    const button = preview.querySelector("button");
    button.addEventListener("click", () => {
      reveal();
      const heading = document.getElementById("tbTitle");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }, { once: true });
    offer.hidden = true;
    preview.hidden = false;
    notify("preview");
    // Keep the one-shot particles in the side gutters, away from text and the CTA.
    const firstAppearance = !saved.celebrated;
    const persisted = store({ celebrated: true });
    if (firstAppearance && persisted && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const particles = document.createElement("div");
      particles.className = "preConfetti";
      particles.setAttribute("aria-hidden", "true");
      for (let index = 0; index < 12; index++) {
        const piece = document.createElement("i");
        piece.style.setProperty("--x", `${index < 6 ? 1 + index * 1.6 : 91 + (index - 6) * 1.6}%`);
        piece.style.setProperty("--drift", `${index % 2 ? 8 : -8}px`);
        piece.style.setProperty("--delay", `${(index % 6) * 45}ms`);
        particles.appendChild(piece);
      }
      preview.appendChild(particles);
      window.setTimeout(() => particles.remove(), 2000);
    }
  };
  window.OecherOfferPreview = Object.freeze({ present, savingsFor });
})();
