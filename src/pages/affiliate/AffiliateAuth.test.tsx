import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";
import { WebsiteConfigProvider } from "@/lib/websiteConfig";
import AffiliateAuth from "./AffiliateAuth";

describe("AffiliateAuth registration invitations", () => {
  afterEach(() => vi.restoreAllMocks());

  it("forwards the URL invite token without writing it to browser storage", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const localStorageSpy = vi.spyOn(Storage.prototype, "setItem");
    const { container } = render(
      <MemoryRouter initialEntries={["/empfehlungsprogramm/registrieren?lang=de&inviteToken=opaque%2F%2Btoken"]}>
        <WebsiteConfigProvider><I18nProvider><AffiliateAuth mode="register" /></I18nProvider></WebsiteConfigProvider>
      </MemoryRouter>,
    );

    for (const [name, value] of [["name", "Ada"], ["email", "ada@example.test"], ["password", "secret"], ["confirmPassword", "secret"]]) {
      fireEvent.change(container.querySelector(`[name="${name}"]`)!, { target: { value } });
    }
    fireEvent.click(container.querySelector('[name="consent"]')!);
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ name: "Ada", email: "ada@example.test", password: "secret", inviteToken: "opaque/+token" });
    expect(localStorageSpy.mock.calls.flat()).not.toContain("opaque/+token");
  });
});
