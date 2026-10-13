import { createElement, type ReactNode } from "react";

const tags = new Set(["h1", "h2", "h3", "h4", "p", "br", "strong", "b", "em", "i", "section", "div", "address", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td", "hr"]);

/** Inert template parsing, then React elements with a strict allowlist. No raw HTML is mounted. */
export function parseLegalHtml(html: string): ReactNode[] | null {
  if (!html.trim()) return null;
  const template = document.createElement("template");
  template.innerHTML = html;
  let valid = true;
  const convert = (node: Node, key: number): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType === Node.COMMENT_NODE) return null;
    if (!(node instanceof HTMLElement)) { valid = false; return null; }
    const tag = node.tagName.toLowerCase();
    if (!tags.has(tag)) { valid = false; return null; }
    const props: Record<string, string | number> = { key };
    for (const attribute of Array.from(node.attributes)) {
      const { name, value } = attribute;
      if (name === "class") props.className = value;
      else if (tag === "a" && name === "href") {
        // No relative, protocol-relative, credential-bearing, script or data URLs.
        try {
          const url = new URL(value);
          if (!["https:", "mailto:"].includes(url.protocol) || url.username || url.password || (/\s/.test(value) || Array.from(value).some(char => char.charCodeAt(0) < 32))) valid = false;
          else props.href = value;
        } catch { valid = false; }
      } else if (tag === "a" && name === "target" && value === "_blank") props.target = value;
      else if (!(tag === "a" && name === "rel" && /^(noopener|noreferrer|nofollow)( (noopener|noreferrer|nofollow))*$/.test(value))) valid = false;
    }
    if (tag === "a") props.rel = "noopener noreferrer";
    const children = Array.from(node.childNodes).map(convert);
    return createElement(tag, props, ...children);
  };
  const nodes = Array.from(template.content.childNodes).map(convert);
  return valid && template.content.textContent?.trim() ? nodes : null;
}
