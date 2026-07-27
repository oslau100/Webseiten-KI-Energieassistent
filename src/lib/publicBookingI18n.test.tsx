import { render,screen,waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe,expect,it,vi } from "vitest";
import { bookingTranslations,BOOKING_ERROR_CODES } from "./publicBookingI18n";
import { I18nProvider } from "./i18n";
import { WebsiteConfigProvider } from "./websiteConfig";
import { BookingContactForm } from "@/components/booking/BookingContactForm";
const langs=["de","en","tr","ru","ar","it","zh","hi","es","fr","nl","pl"];
describe("booking translations",()=>{
 it("contains every explicit key and backend error in all twelve languages",()=>{expect(Object.keys(bookingTranslations)).toEqual(langs);const expected=Object.keys(bookingTranslations.de);for(const lang of langs){expect(Object.keys(bookingTranslations[lang])).toEqual(expected);for(const code of BOOKING_ERROR_CODES)expect(bookingTranslations[lang][`error_${code}`]).toBeTruthy();}});
 it("does not reuse the German object or German privacy text",()=>{for(const lang of langs.slice(1)){expect(bookingTranslations[lang]).not.toBe(bookingTranslations.de);expect(bookingTranslations[lang].privacyLink).not.toBe(bookingTranslations.de.privacyLink);}});
 it.each([["en","Privacy policy"],["tr","Gizlilik politikası"],["ar","سياسة الخصوصية"]])("renders localized privacy link for %s",async(lang,label)=>{vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response("[]",{status:200}));render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}><WebsiteConfigProvider><I18nProvider><BookingContactForm value={{salutation:"",first_name:"",last_name:"",email:"",phone:"",note:"",consent:false,honeypot:""}} onChange={()=>{}} onSubmit={()=>{}} submitting={false} errors={{}} b={bookingTranslations[lang]} privacyPath="/datenschutz" onBack={()=>{}}/></I18nProvider></WebsiteConfigProvider></MemoryRouter>);expect(screen.getByRole("link",{name:new RegExp(label)})).toHaveAttribute("rel","noopener noreferrer");if(lang==="ar")await waitFor(()=>expect(document.documentElement.dir).toBe("rtl"));});
});
