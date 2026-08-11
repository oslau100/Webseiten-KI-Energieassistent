import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const scrollToHash = (hash: string) => {
  if (!hash) return;

  const element = document.getElementById(decodeURIComponent(hash.replace(/^#/, "")));
  if (!element) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
};

export const useHashScroll = () => {
  const { hash } = useLocation();

  useEffect(() => {
    scrollToHash(hash);
  }, [hash]);
};
