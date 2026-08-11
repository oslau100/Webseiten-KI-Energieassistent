import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, Link } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { useHashScroll } from "@/hooks/use-hash-scroll";

const targets = ["problem", "loesung", "vorteile", "ueber-uns"];

const Page = () => {
  useHashScroll();

  return (
    <>
      <Header />
      {targets.map((id) => <section id={id} key={id}>{id}</section>)}
    </>
  );
};

const renderPage = () => render(<BrowserRouter><Page /></BrowserRouter>);

describe("mobile hash navigation", () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it.each([
    ["Problem", "#problem"],
    ["Lösung", "#loesung"],
    ["Vorteile", "#vorteile"],
    ["Über uns", "#ueber-uns"],
  ])("closes the menu before navigating to %s with one scroll", async (name, hash) => {
    renderPage();
    const trigger = screen.getByRole("button", { name: "Navigationsmenü öffnen" });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("link", { name }));

    await waitFor(() => expect(window.location.hash).toBe(hash));
    expect(screen.queryByRole("dialog", { name: "Mobile Navigation" })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("scrolls a direct hash URL and respects reduced motion", () => {
    window.history.replaceState({}, "", "/#vorteile");
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    renderPage();

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("keeps desktop links on the controlled hash navigation path", async () => {
    renderPage();

    fireEvent.click(screen.getAllByRole("link", { name: "Problem" })[0]);

    await waitFor(() => expect(window.location.hash).toBe("#problem"));
    expect(scrollIntoView).toHaveBeenCalledOnce();
  });

  it("responds once to browser back and forward hash navigation", async () => {
    render(
      <BrowserRouter>
        <Link to="#problem">Problem</Link>
        <Link to="#vorteile">Vorteile</Link>
        {targets.map((id) => <section id={id} key={id}>{id}</section>)}
        <HashScroller />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Problem" }));
    fireEvent.click(screen.getByRole("link", { name: "Vorteile" }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2));

    act(() => {
      window.history.replaceState({}, "", "/#problem");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(window.location.hash).toBe("#problem"));
    expect(scrollIntoView).toHaveBeenCalledTimes(3);

    act(() => {
      window.history.replaceState({}, "", "/#vorteile");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(window.location.hash).toBe("#vorteile"));
    expect(scrollIntoView).toHaveBeenCalledTimes(4);
  });
});

const HashScroller = () => {
  useHashScroll();
  return null;
};
