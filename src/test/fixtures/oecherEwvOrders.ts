// Synthetic order IDs and the approved tariff identities are deliberately separate.
export const orderUuid = "11111111-1111-4111-8111-111111111111";
export const oecherLocation = "uuDEvEGcyd3mMiKWKH4Z";
export const ewvProviderId = "1599c81f-0ba2-4f87-b17a-96b723e53f7a";
export const ewvLegalName = "EWV Energie- und Wasser-Versorgung GmbH";
export const ewvTariffs = [
  [52071, "5426805f-8551-4c76-8266-118365289ff8", "regiostrom Heimatheld"],
  [52072, "ce451ecf-876a-435a-9e62-a13fcfef075f", "regiostrom Aktionsheld"],
  [52073, "cda069f6-b345-4311-a05c-5f1da5482f14", "regiogas Heimatheld"],
  [52074, "9e46835a-1a89-4bd6-bd64-8694a95b2b12", "regiogas Aktionsheld"],
] as const;

// Mirrors the confirmed production shape: one tariff UUID, no provider ID.
export const makeEwvOrder = (id = 52071, provider = ewvLegalName + " Stolberg") => ({
  uuid: orderUuid,
  location_id: oecherLocation,
  tariff_provider: provider,
  tariff_name: ewvTariffs.find(t => t[0] === id)?.[2] || "unbekannt",
  tarif_snapshot: {
    selected_preisliste: {
      tarif_id: id,
      tarif_uuid: ewvTariffs.find(t => t[0] === id)?.[1] || "unknown-tariff",
      anbieter: provider,
    },
  },
});
