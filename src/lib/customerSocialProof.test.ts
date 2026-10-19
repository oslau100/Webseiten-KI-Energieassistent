import { describe, expect, it } from "vitest";
import { customerCount, customerCountText } from "./customerSocialProof";

const templates = {
  de: "Über {customer_count} Haushalte", en: "Over {customer_count} households", tr: "{customer_count}'den fazla hane",
  ru: "Более {customer_count} домохозяйств", ar: "أكثر من {customer_count} أسرة", it: "Oltre {customer_count} famiglie",
  zh: "已有超过{customer_count}个家庭", hi: "{customer_count} से अधिक परिवार", es: "Más de {customer_count} hogares",
  fr: "Plus de {customer_count} foyers", nl: "Meer dan {customer_count} huishoudens", pl: "Ponad {customer_count} gospodarstw",
};

describe("single configured customer count", () => {
  it.each(Object.entries(templates))("formats the one value for %s without altering surrounding copy", (locale, template) => {
    expect(customerCountText(template, 4321, locale)).toBe(template.replace("{customer_count}", new Intl.NumberFormat(locale).format(4321)));
    expect(customerCountText(template, 0, locale)).toContain(new Intl.NumberFormat(locale).format(0));
  });
  it("prefers the shared field and only falls back to the validated German customer stat", () => {
    const stats = { items: { de: [{ end: 10000 }, { end: 1500 }], en: [{ end: 10000 }, { end: 9999 }] } };
    expect(customerCount({ sections: { stats } })).toBe(1500);
    expect(customerCount({ sections: { stats: { ...stats, customer_count: 3000 } } })).toBe(3000);
    expect(customerCount({ sections: { stats: { items: { en: [{}, { end: 9999 }] } } } })).toBeUndefined();
  });
  it.each([null, "1500", -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid explicit values instead of masking them: %s", value => {
    expect(customerCount({ sections: { stats: { customer_count: value, items: { de: [{}, { end: 1500 }] } } } })).toBeUndefined();
  });
  it("preserves unknown copy without guessing numbers or inventing missing counts", () => {
    expect(customerCountText("Over 2,000 households", 1500, "en")).toBe("Over 2,000 households");
    expect(customerCountText("Personal service", 1500, "en")).toBe("Personal service");
    expect(customerCountText("__proto__", 1500, "en")).toBe("__proto__");
    expect(customerCountText("", 1500, "en")).toBe("");
    expect(customerCountText("Over {customer_count}", undefined, "en")).toBe("");
    expect(customerCount({})).toBeUndefined();
  });
  it("keeps the exact published wording visible and consistent before the DB template rollout", () => {
    expect(customerCountText("Mehr als 2.000 Haushalte nutzen den Energieassistenten bereits", 1500, "de"))
      .toBe("Mehr als 1.500 Haushalte nutzen den Energieassistenten bereits");
    expect(customerCountText("Already 2,000+ satisfied users across Germany", 1500, "en"))
      .toBe("Already 1,500+ satisfied users across Germany");
    expect(customerCountText("أكثر من 2,000 أسرة تستخدم مساعد الطاقة بالفعل", 1500, "ar"))
      .toBe(`أكثر من ${new Intl.NumberFormat("ar").format(1500)} أسرة تستخدم مساعد الطاقة بالفعل`);
    const changedCopy = "More than 2,001 households already use the Energy Assistant";
    expect(customerCountText(changedCopy, 1500, "en")).toBe(changedCopy);
    const germanCopy = "Mehr als 2.000 Haushalte nutzen den Energieassistenten bereits";
    expect(customerCountText(germanCopy, 1500, "en")).toBe(germanCopy);
    expect(customerCountText(germanCopy, undefined, "de")).toBe(germanCopy);
  });
});
