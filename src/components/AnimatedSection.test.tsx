import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedSection } from "./AnimatedSection";
const originalObserver=globalThis.IntersectionObserver;
afterEach(()=>{vi.restoreAllMocks();globalThis.IntersectionObserver=originalObserver;window.IntersectionObserver=originalObserver;});
describe('marketing section visibility',()=>{
 it('reveals a section immediately with reduced motion',()=>{
  vi.spyOn(window,'matchMedia').mockReturnValue({matches:true} as MediaQueryList);
  render(<AnimatedSection>Visible content</AnimatedSection>);
  expect(screen.getByText('Visible content')).toHaveClass('opacity-100');
 });
 it('keeps content visible when IntersectionObserver is unsupported',()=>{
  globalThis.IntersectionObserver=undefined as unknown as typeof IntersectionObserver;
  window.IntersectionObserver=globalThis.IntersectionObserver;
  render(<AnimatedSection>Fallback content</AnimatedSection>);
  expect(screen.getByText('Fallback content')).toHaveClass('opacity-100');
 });
 it('reveals after actual intersection and disconnects on unmount',()=>{
  let callback:IntersectionObserverCallback;
  const observe=vi.fn(),unobserve=vi.fn(),disconnect=vi.fn();
  globalThis.IntersectionObserver=class {constructor(cb:IntersectionObserverCallback){callback=cb;}observe=observe;unobserve=unobserve;disconnect=disconnect;} as unknown as typeof IntersectionObserver;
  window.IntersectionObserver=globalThis.IntersectionObserver;
  const {unmount}=render(<AnimatedSection>Scroll content</AnimatedSection>);
  const element=screen.getByText('Scroll content');
  expect(element).toHaveClass('opacity-0');
  act(()=>callback([{isIntersecting:true,target:element,boundingClientRect:element.getBoundingClientRect(),intersectionRatio:1,intersectionRect:element.getBoundingClientRect(),rootBounds:null,time:0}],{} as IntersectionObserver));
  expect(element).toHaveClass('opacity-100');
  expect(unobserve).toHaveBeenCalledWith(element);unmount();expect(disconnect).toHaveBeenCalledOnce();
 });
});
