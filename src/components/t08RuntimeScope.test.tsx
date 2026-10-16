import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { Stats } from './Stats';
import { Header } from './Header';
import { Hero } from './Hero';
import { Solution } from './Solution';
import Jahresrechnung from '@/pages/Jahresrechnung';
const state = vi.hoisted(() => ({ customer: false, lang: 'en', arrays: {} as Record<string, unknown[]>, texts: {} as Record<string, string> }));
vi.mock('@/lib/i18n', () => ({
  LANGUAGES: [{ code: 'en', label: 'English', flagUrl: '/flag.svg' }],
  useI18n: () => ({ lang: state.lang, t: (key: string) => key, withLang: (path: string) => path, setLang: vi.fn() }),
}));
vi.mock('@/lib/websiteConfig', () => ({ useWebsiteConfig: () => ({
  customerRuntime: state.customer, content: {}, layout: {}, design: { assets: { logo_header: '/logo.png', hero_image: '/hero.png' } },
  getText: (path: string, fallback: string) => state.texts[path] ?? (state.customer ? '' : fallback),
  getArray: <T,>(path: string, fallback: T[]) => state.arrays[path] ?? (state.customer ? [] : fallback),
}) }));
vi.mock('./AnimatedSection', () => ({ AnimatedSection: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
const originalObserver = globalThis.IntersectionObserver;
const mount = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);
beforeEach(() => { state.customer = false; state.lang = 'en'; state.arrays = {}; state.texts = {}; });
afterEach(() => { globalThis.IntersectionObserver = originalObserver; window.IntersectionObserver = originalObserver; vi.restoreAllMocks(); });
describe('T08 customer changes preserve reference runtime', () => {
  it('animates reference statistics only after intersection and finishes with German formatting', () => {
    let intersect: IntersectionObserverCallback = () => {};
    const Observer = class { constructor(callback: IntersectionObserverCallback) { intersect = callback; } observe() {} disconnect() {} } as unknown as typeof IntersectionObserver;
    globalThis.IntersectionObserver = Observer; window.IntersectionObserver = Observer;
    let frame: FrameRequestCallback = () => {};
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frame = callback; return 1; });
    state.arrays['sections.stats.items.en'] = [{ end: 1234, suffix: '+', label: 'Reference metric' }];
    mount(<Stats />);
    expect(screen.getByText('0+')).toBeInTheDocument();
    act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    act(() => frame(100));
    act(() => frame(2100));
    expect(screen.getByText('1.234+')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
  it('renders configured customer metrics immediately and excludes invalid numbers', () => {
    state.customer = true;
    state.arrays['sections.stats.items.en'] = [{ end: 1234, label: 'Configured metric' }, { end: NaN, label: 'Invalid metric' }];
    mount(<Stats />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.queryByText('Invalid metric')).toBeNull();
  });
  it.each([false, true])('keeps image shadows and header geometry scoped (customer=%s)', customer => {
    state.customer = customer; state.texts['sections.solution.image_url'] = '/solution.png';
    const { container } = mount(<><Header /><Hero /><Solution /></>);
    const images = Array.from(container.querySelectorAll('img')).filter(image => ['/hero.png', '/solution.png'].includes(image.getAttribute('src') || ''));
    expect(images).toHaveLength(2);
    for (const image of images) expect(image.classList.contains('bg-transparent')).toBe(customer);
    for (const image of images) expect(image.classList.contains('drop-shadow-2xl')).toBe(!customer);
    const logo = container.querySelector('img[src="/logo.png"]');
    expect(logo?.classList.contains('max-w-[28vw]')).toBe(customer);
    expect(container.querySelector('header a[href="/jahresrechnung"]')?.classList.contains('max-w-[45vw]')).toBe(customer);
  });
  it('retains five-star annual rendering and the existing Stats section on a noncustomer site', () => {
    state.arrays['sections.jahresrechnung.reviews.en'] = [{ name: 'Configured reference author', title: 'Existing review', text: 'Existing text', rating: 2 }];
    mount(<Jahresrechnung />);
    expect(screen.getByRole('img', { name: '5/5' }).querySelectorAll('svg')).toHaveLength(5);
    expect(screen.queryByRole('img', { name: '2/5' })).toBeNull();
    expect(screen.getByText('Tarife und Rechnungen bereits geprüft')).toBeInTheDocument();
  });
});
