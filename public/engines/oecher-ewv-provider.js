/* Public display identity only. No provider lookup, tariff choice or data writes. */
(() => {
  const locationId = "uuDEvEGcyd3mMiKWKH4Z";
  const providerId = "1599c81f-0ba2-4f87-b17a-96b723e53f7a";
  const legalName = "EWV Energie- und Wasser-Versorgung GmbH";
  const historicalName = legalName + " Stolberg";
  const names = new Set([legalName, historicalName]);
  const tariffs = Object.freeze({
    52071: { uuid: "5426805f-8551-4c76-8266-118365289ff8", name: "regiostrom Heimatheld" },
    52072: { uuid: "ce451ecf-876a-435a-9e62-a13fcfef075f", name: "regiostrom Aktionsheld" },
    52073: { uuid: "cda069f6-b345-4311-a05c-5f1da5482f14", name: "regiogas Heimatheld" },
    52074: { uuid: "9e46835a-1a89-4bd6-bd64-8694a95b2b12", name: "regiogas Aktionsheld" },
  });
  const text = value => typeof value === "string" ? value.trim() : "";
  const object = value => {
    if (typeof value === "string") { try { value = JSON.parse(value); } catch { return {}; } }
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  };
  const parts = row => {
    const snapshot = object(row?.tarif_snapshot);
    const selected = object(snapshot.selected_preisliste);
    return { snapshot, selected, provider: Object.keys(object(row?.anbieter)).length ? object(row.anbieter) : object(snapshot.anbieter) };
  };
  const isEwv = (row, tenant) => {
    if (tenant !== locationId || row?.location_id !== locationId) return false;
    const { snapshot, selected } = parts(row);
    const providers = [row.anbieter, snapshot.anbieter, selected.anbieter].map(object);
    const present = values => values.filter(value => value != null);
    const ids = present([row.anbieter_id, snapshot.anbieter_id, selected.anbieter_id, ...providers.map(p => p.id)]);
    if (ids.some(id => text(id) !== providerId)) return false;
    const id = String(selected.tarif_id ?? "").trim();
    const expected = Object.hasOwn(tariffs, id) ? tariffs[id] : null;
    if (!expected || present([row.tarif_id, snapshot.tarif_id]).some(value => String(value).trim() !== id)) return false;
    // One canonical selected UUID is enough. Every other stored identity must
    // agree, including when an optional provider ID is present. row.uuid is an order ID.
    const uuids = present([row.tarif_uuid, snapshot.tarif_uuid, selected.tarif_uuid]);
    if (!uuids.length || uuids.some(uuid => text(uuid).toLowerCase() !== expected.uuid)) return false;
    const labels = [row.tariff_provider, snapshot.tariff_provider,
      ...[row.anbieter, snapshot.anbieter, selected.anbieter].filter(value => typeof value === "string"),
      ...providers.map(p => p.name)].map(text).filter(Boolean);
    const products = [row.tariff_name, row.tarif, snapshot.tariff_name, selected.tarif, selected.tarifname].map(text).filter(Boolean);
    const normalizeProduct = value => value.replace(/\s+/g, " ").toLowerCase();
    return labels.length > 0 && labels.every(name => names.has(name)) &&
      products.length > 0 && products.every(name => normalizeProduct(name) === normalizeProduct(expected.name));
  };
  const displayName = (row, tenant) => {
    const { selected, provider } = parts(row);
    // Snapshot display_name belongs to this order; never guess from a brand substring.
    const preferred = text(provider.display_name) || text(selected.anbieter_display_name);
    if (isEwv(row, tenant)) return "EWV";
    return (preferred === "EWV" ? "" : preferred) || text(provider.name) || text(row?.tariff_provider) || text(row?.anbieter) || "—";
  };
  const shortenAdvice = (container, row, tenant) => {
    if (!container || !isEwv(row, tenant)) return;
    const display = displayName(row, tenant);
    const walker = container.ownerDocument.createTreeWalker(container, 4 /* SHOW_TEXT */);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      node.nodeValue = node.nodeValue.split(historicalName).join(display).split(legalName).join(display);
    }
  };
  window.OecherEwvProvider = Object.freeze({ locationId, providerId, legalName, historicalName, names, parts, isEwv, displayName, shortenAdvice });
})();
