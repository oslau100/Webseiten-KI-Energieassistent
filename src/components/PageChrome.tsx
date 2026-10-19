import type { ReactNode } from "react";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { websiteSections } from "@/lib/websiteSections";

/** Visibility follows config; navigation and legal footer retain their semantic page positions. */
export function PageChrome({ page, id, children }: { page: "home" | "annual"; id: "header" | "footer"; children: ReactNode }) {
  const { layout, customerRuntime } = useWebsiteConfig();
  return websiteSections(layout, page, [id], customerRuntime).includes(id) ? <>{children}</> : null;
}
