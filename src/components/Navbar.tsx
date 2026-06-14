import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="https://vibe.filesafe.space/1775221216043671236/attachments/b2572ba8-d0c7-41dd-a8da-2b7674556501.png" 
              alt="TarifButler Logo" 
              className="h-40 md:h-56 w-auto object-contain -my-8 md:-my-12"
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">So funktioniert's</a>
            <a href="/#features" className="text-sm font-medium hover:text-primary transition-colors">Vorteile</a>
            <Link to="/ueber-uns" className="text-sm font-medium hover:text-primary transition-colors">Über uns</Link>
            <a href="/#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
          </div>

          <div className="flex items-center">
            <Button variant="outline" className="rounded-full border-2 border-foreground font-bold text-xs px-4 h-8 md:text-sm md:px-6 md:h-10 hover:bg-foreground hover:text-background" asChild>
              <Link to="/start">Ersparnis prüfen</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
