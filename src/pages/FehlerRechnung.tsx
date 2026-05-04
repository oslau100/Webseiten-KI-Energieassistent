import { Link } from "react-router-dom";
import { SimpleHeader } from "@/components/SimpleHeader";
import { SimpleFooter } from "@/components/SimpleFooter";
import { useI18n } from "@/lib/i18n";

const FehlerRechnung = () => {
  const { t, withLang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pt-24 md:pt-32">
      <SimpleHeader />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl text-center space-y-6 md:space-y-8">
          <h1 className="mx-auto max-w-3xl text-3xl md:text-5xl font-bold leading-tight">
            {t("status_invoice_error_title")}
          </h1>
          <p className="mx-auto max-w-3xl text-base md:text-xl text-foreground/90 leading-relaxed">
            {t("status_invoice_error_body")}
          </p>
          <p className="mx-auto max-w-3xl text-sm md:text-base text-foreground/80 leading-relaxed">
            {t("status_invoice_error_hint")}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link
              to={withLang("/rechnung")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base md:text-lg font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t("status_invoice_error_cta")}
            </Link>
            <Link
              to={withLang("/")}
              className="text-sm md:text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("status_invoice_error_home")}
            </Link>
          </div>
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

export default FehlerRechnung;
