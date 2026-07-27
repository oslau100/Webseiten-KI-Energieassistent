import { fireEvent,render,screen,waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach,describe,expect,it,vi } from "vitest";
import Tarif from "@/pages/Tarif";
import { I18nProvider,LANGUAGES } from "@/lib/i18n";
import { tariffCallbackTranslations } from "@/lib/tariffCallbackI18n";
import { WebsiteConfigProvider } from "@/lib/websiteConfig";

const wrapper=({children,lang="de"}:{children:React.ReactNode;lang?:string})=><MemoryRouter initialEntries={[`/tarif?lang=${lang}`]}><WebsiteConfigProvider><I18nProvider>{children}</I18nProvider></WebsiteConfigProvider></MemoryRouter>;
afterEach(()=>{vi.restoreAllMocks();document.documentElement.dir="ltr";});

describe("TarifCallbackSection",()=>{
 it("renders between the existing offer iframe and footer with configured avatar",async()=>{vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response("[]",{status:200}));const{container}=render(wrapper({children:<Tarif/>}));const iframe=screen.getByTitle("Angebotsseite Loader");const section=await screen.findByTestId("tarif-callback-section");const footer=container.querySelector("footer")!;expect(iframe.compareDocumentPosition(section)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();expect(section.compareDocumentPosition(footer)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();expect(screen.getByRole("heading",{name:"Noch Fragen zu deiner Tarifempfehlung?"})).toBeVisible();expect(screen.getByRole("link",{name:"Rückruf buchen"})).toHaveAttribute("href","/rueckruf-buchen?lang=de");expect(screen.getByRole("img",{name:/Marcel Kromen/})).toHaveAttribute("src",expect.stringContaining("c0d6a4ae"));});
 it("shows a neutral fixed-size fallback when the configured avatar fails",async()=>{vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response("[]",{status:200}));render(wrapper({children:<Tarif/>}));const avatar=await screen.findByRole("img",{name:/Marcel Kromen/});fireEvent.error(avatar);const fallback=screen.getByRole("img",{name:/Persönliche Beratung/});expect(fallback).toBeVisible();expect(fallback.tagName).toBe("DIV");});
 it("preserves Arabic language and RTL navigation",async()=>{vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response("[]",{status:200}));render(wrapper({children:<Tarif/>,lang:"ar"}));expect(await screen.findByRole("heading",{name:"هل لديك أسئلة حول توصية التعرفة؟"})).toBeVisible();expect(screen.getByRole("link",{name:"حجز مكالمة"})).toHaveAttribute("href","/rueckruf-buchen?lang=ar");await waitFor(()=>expect(document.documentElement.dir).toBe("rtl"));});
 it("provides all four callback keys in all twelve languages",()=>{expect(Object.keys(tariffCallbackTranslations)).toEqual(LANGUAGES.map(({code})=>code));for(const{code}of LANGUAGES)expect(Object.keys(tariffCallbackTranslations[code]).sort()).toEqual(["tariff_callback_avatar_alt","tariff_callback_button","tariff_callback_subtitle","tariff_callback_title"]);});
});
