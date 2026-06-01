import { describe, expect, it } from "vitest";
import {
  createWebsiteContentResolvers,
  mergeWebsiteConfigLayer,
  resolveWebsiteConfigLayers,
  type JsonRecord,
} from "./websiteContentResolver";

describe("websiteContentResolver", () => {
  it("preserves the existing deep merge contract, including array replacement", () => {
    const base: JsonRecord = {
      colors: { primary: "#16a34a", text: "#0f172a" },
      sections: ["header", "hero", "footer"],
      nested: { items: ["a", "b"], label: "base" },
    };

    const merged = mergeWebsiteConfigLayer(base, {
      colors: { primary: "#000000" },
      sections: ["hero"],
      nested: { items: ["c"] },
    });

    expect(merged).toEqual({
      colors: { primary: "#000000", text: "#0f172a" },
      sections: ["hero"],
      nested: { items: ["c"], label: "base" },
    });
  });

  it("keeps text, array, object and interpolation fallback behavior stable", () => {
    const resolvers = createWebsiteContentResolvers({
      plain: "Kromen",
      localized: { en: "Energy assistant", de: "Energieassistent" },
      localizedWithoutDe: { fr: "Assistant énergie", en: "Energy assistant" },
      list: ["eins", "zwei"],
      object: { value: "ok" },
      notObject: ["array"],
    });

    expect(resolvers.getText("plain", "Fallback")).toBe("Kromen");
    expect(resolvers.getText("localized", "Fallback", "en")).toBe("Energy assistant");
    expect(resolvers.getText("localized", "Fallback")).toBe("Energieassistent");
    expect(resolvers.getText("localizedWithoutDe", "Fallback")).toBe("Assistant énergie");
    expect(resolvers.getText("missing", "Fallback")).toBe("Fallback");
    expect(resolvers.getArray("list", ["fallback"])).toEqual(["eins", "zwei"]);
    expect(resolvers.getArray("missing", ["fallback"])).toEqual(["fallback"]);
    expect(resolvers.getObject("object", { value: "fallback" })).toEqual({ value: "ok" });
    expect(resolvers.getObject("notObject", { value: "fallback" })).toEqual({ value: "fallback" });
    expect(resolvers.interpolate("Hallo {{ name }} aus {{place}}", { name: "Kromen" })).toBe("Hallo Kromen aus ");
  });

  it("resolves remote website layers over defaults without changing missing defaults", () => {
    const resolved = resolveWebsiteConfigLayers(
      {
        design: { colors: { primary: "#16a34a", text: "#0f172a" } },
        content: { brand: { name: "Kromen Energieassistent" } },
        layout: { pages: { home: { sections: ["header", "hero"] } } },
      },
      {
        webseite_design_config: { colors: { text: "#111111" } },
        webseite_content_config: { brand: { contact_email: "info@kromen-energieassistent.de" } },
      },
    );

    expect(resolved).toEqual({
      design: { colors: { primary: "#16a34a", text: "#111111" } },
      content: { brand: { name: "Kromen Energieassistent", contact_email: "info@kromen-energieassistent.de" } },
      layout: { pages: { home: { sections: ["header", "hero"] } } },
    });
  });
});
