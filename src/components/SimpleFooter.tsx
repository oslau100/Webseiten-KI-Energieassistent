import { Link, useLocation } from "react-router-dom";

const BRAND_NAME = "TarifButler";

function useLangSuffix() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const lang = params.get("lang") || params.get("language");
  return lang ? `?lang=${encodeURIComponent(lang)}` : "";
}

export const SimpleFooter = () => {
  const langSuffix = useLangSuffix();

  return (
    <footer className="mt-auto border-t bg-muted py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Alle Rechte vorbehalten {BRAND_NAME}
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to={`/datenschutz${langSuffix}`} className="transition-colors hover:text-primary">
            Datenschutz
          </Link>
          <Link to={`/impressum${langSuffix}`} className="transition-colors hover:text-primary">
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  );
};
