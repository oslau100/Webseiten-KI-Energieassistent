import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRef, useState } from "react";
import { landingAssets } from "@/lib/landingAssets";

const navLinks = [
  { name: "Problem", href: "#problem" },
  { name: "Lösung", href: "#loesung" },
  { name: "Vorteile", href: "#vorteile" },
  { name: "Über uns", href: "#ueber-uns" },
];

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const pendingHash = useRef<string | null>(null);

  const handleMobileNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHome) return;

    event.preventDefault();
    pendingHash.current = href;
    setIsOpen(false);
  };

  const handleCloseAutoFocus = () => {
    if (pendingHash.current) {
      const hash = pendingHash.current;
      pendingHash.current = null;
      navigate({ pathname: "/", hash });
    }
  };

  return (
    <header className="relative z-50 w-full bg-[#000000] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.075]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container relative z-10 mx-auto flex py-0 items-center justify-between px-4 md:px-8">
        <a href="/" className="flex items-center z-10 -my-14 md:-my-16">
          <img
            src={landingAssets.logo}
            alt="Energieassistent.io"
            width={800}
            height={800}
            decoding="async"
            className="h-48 md:h-64 w-auto"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-[14px] lg:text-[15px] font-medium z-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={isHome ? link.href : `/${link.href}`}
              className="text-gray-300 transition-colors hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden z-10">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Navigationsmenü öffnen"
                aria-expanded={isOpen}
                className="bg-transparent text-white hover:bg-transparent hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              aria-label="Mobile Navigation"
              onCloseAutoFocus={handleCloseAutoFocus}
              className="bg-[#000000] border-b-0 text-white pt-20"
            >
              <nav className="flex flex-col items-center gap-6 text-lg font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={isHome ? link.href : `/${link.href}`}
                    onClick={(event) => handleMobileNavClick(event, link.href)}
                    className="text-gray-300 transition-colors hover:text-white w-full text-center py-2"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
