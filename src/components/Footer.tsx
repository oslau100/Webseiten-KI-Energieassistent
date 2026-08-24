import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#f4f5f7] text-[#111827] py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 mt-8">
          <div className="col-span-1">
            <Link to="/" className="inline-block -mt-20">
              <img 
                src="https://vibe.filesafe.space/1775221216043671236/attachments/1051300b-abc5-4b5b-bcc5-ac3429d17253.png" 
                alt="TarifButler" 
                className="h-56 w-auto object-contain"
              />
            </Link>
            
            <div className="space-y-6 -mt-16">
              <div>
                <p className="font-bold mb-1 text-base">tarif-butler.de ist ein Angebot der</p>
                <p className="text-[#111827] text-base">Switch Energy GmbH</p>
                <p className="text-[#111827] text-base">Eifelstr. 3</p>
                <p className="text-[#111827] text-base">52068 Aachen</p>
                <p className="text-[#111827] text-base">Deutschland</p>
              </div>

              <div>
                <p className="font-bold mb-1 text-base">Kundenservice</p>
                <a href="mailto:kundenservice@tarif-butler.de" className="text-[#111827] hover:text-primary transition-colors text-base">
                  kundenservice@tarif-butler.de
                </a>
              </div>
            </div>
          </div>
          
          <div className="md:pl-12">
            <h4 className="text-xl font-bold mb-6 text-[#111827]">Sitemap</h4>
            <ul className="space-y-4">
              <li>
                <a href="/#how-it-works" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  So funktioniert's
                </a>
              </li>
              <li>
                <a href="/#features" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  Vorteile
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/ueber-uns" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  Über uns
                </Link>
              </li>
              <li>
                <Link to="/empfehlungsprogramm" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  Empfehlungsprogramm
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-6 text-[#111827]">Rechtliches</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/datenschutz" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/impressum" className="text-[#111827] hover:text-primary transition-colors text-lg">
                  Impressum
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#111827] text-sm">
            &copy; 2025 Alle Rechte vorbehalten. Switch Energy GmbH
          </p>
        </div>
      </div>
    </footer>
  );
};
