import { Header } from "./Header";
import { Footer } from "./Footer";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { parseLegalHtml } from "@/lib/legalHtml";

export const LegalPage = ({ page, title }: { page: "impressum" | "datenschutz"; title: string }) => {
  const { getText, getObject } = useWebsiteConfig();
  const ready = getObject("legal", { ready: false }).ready === true;
  const required = ["firma", "email"].every(key => getText(`legal.variables.${key}`, "").trim());
  const body = ready && required ? parseLegalHtml(getText(`pages.${page}.html`, "")) : null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-36 md:pt-48 pb-16">
        {body ? <div className="prose max-w-none text-muted-foreground">{body}</div> : <>
          <h1 className="text-3xl font-bold mb-8 text-primary-ink">{title}</h1>
          <p className="text-muted-foreground">Die rechtlichen Angaben werden für diesen Standort vorbereitet.</p>
        </>}
      </main>
      <Footer />
    </div>
  );
};
