import { Mail, Phone } from "lucide-react";
import { useLocation } from "react-router-dom";
import { landingAssets } from "@/lib/landingAssets";

export const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const getHref = (hash: string) => isHome ? hash : `/${hash}`;

  return (
    <footer className="relative bg-[#000000] pt-16 pb-8 overflow-hidden text-white border-t border-white/5">
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

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 mb-16">
          {/* Column 1: Info */}
          <div className="flex flex-col">
            <div className="flex items-start">
              <img 
                src={landingAssets.logo}
                alt="Laurent Digital" 
                width={800}
                height={800}
                loading="lazy"
                decoding="async"
                className="h-64 md:h-72 w-auto -mt-24 md:-mt-[110px]"
              />
            </div>
            
            <div className="-mt-16 md:-mt-24 flex flex-col space-y-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                Automatisierter<br />
                Strom- & Gasvertrieb
              </p>
              
              <div className="flex flex-col space-y-4">
                <a href="tel:01773324052" className="flex items-center space-x-4 group">
                  <Phone className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-lg">01773324052</span>
                </a>
                <a href="mailto:info@energieassistent.io" className="flex items-center space-x-4 group">
                  <Mail className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                  <span className="text-gray-300 group-hover:text-white transition-colors text-lg">info@energieassistent.io</span>
                </a>
              </div>

              <div className="text-gray-300 text-lg leading-relaxed">
                <p>Adenauerstraße 20A</p>
                <p>52146 Würselen</p>
              </div>
            </div>
          </div>

          {/* Column 2: Sitemap */}
          <div>
            <h3 className="text-2xl font-bold mb-8">Navigation</h3>
            <ul className="space-y-5">
              <li>
                <a href={getHref("#problem")} className="text-gray-300 hover:text-white transition-colors text-lg">
                  Problem
                </a>
              </li>
              <li>
                <a href={getHref("#loesung")} className="text-gray-300 hover:text-white transition-colors text-lg">
                  Lösung
                </a>
              </li>
              <li>
                <a href={getHref("#prozess")} className="text-gray-300 hover:text-white transition-colors text-lg">
                  Prozess
                </a>
              </li>
              <li>
                <a href={getHref("#vorteile")} className="text-gray-300 hover:text-white transition-colors text-lg">
                  Vorteile
                </a>
              </li>
              <li>
                <a href={getHref("#ueber-uns")} className="text-gray-300 hover:text-white transition-colors text-lg">
                  Über uns
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Rechtliches */}
          <div>
            <h3 className="text-2xl font-bold mb-8">Rechtliches</h3>
            <ul className="space-y-5">
              <li>
                <a href="/datenschutz" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="/impressum" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Impressum
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <p className="text-[15px] text-gray-300 mb-6">
            © 2026 Alle Rechte vorbehalten. Energieassistent.io
          </p>
          <p className="text-[13px] text-gray-400 max-w-4xl leading-relaxed">
            This site is not a part of the Facebook TM website or Facebook TM Inc. Additionally, this site is NOT endorsed by FacebookTM in any way. FACEBOOK TM is a trademark of FACEBOOK TM, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};
