import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarketingLink } from "./MarketingLink";
import { Button } from "./ui/button";
import { I18nProvider } from "@/lib/i18n";
const state=vi.hoisted(()=>({customer:true,missing:false,missingAvailability:false,missingContact:false,enabled:false}));
vi.mock("@/lib/websiteConfig",()=>({useWebsiteConfig:()=>({customerRuntime:state.customer,layout:{features:{start_survey:state.enabled,rechnung_survey:state.enabled,order_funnel:state.enabled}},content:{},getText:(key:string,_fallback:string,lang='de')=>key==='availability.unavailable'?(state.missingAvailability?'':'Unavailable'):key==='availability.contact'?(state.missingContact?'':'Contact'):key==='brand.contact_email'?'owner@example.test':state.missing?'':['i18n.cta_check_savings','sections.jahresrechnung.cta','sections.hero.cta_text'].includes(key)?`Configured ${lang} ${key}`:''})}));
afterEach(()=>{state.customer=true;state.enabled=false;state.missing=false;state.missingAvailability=false;state.missingContact=false;localStorage.clear();});
function mount(to:string,children:React.ReactNode,lang='de',onClick=vi.fn()){
 return {...render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}><I18nProvider><Button asChild size="lg"><MarketingLink to={to} onClick={onClick}>{children}</MarketingLink></Button></I18nProvider></MemoryRouter>),onClick};
}
describe('blocked customer marketing actions',()=>{
 it.each(['/start?lang=en', '/rechnung?lang=en'])('renders enabled configured actions as accessible links: %s',to=>{
  state.enabled=true;
  const {onClick}=mount(to,'Configured action','en');
  const link=screen.getByRole('link',{name:'Configured action'});
  expect(link).toHaveAttribute('href',to);expect(link).not.toHaveAttribute('aria-disabled');
  fireEvent.click(link);expect(onClick).toHaveBeenCalledOnce();
 });
 it('keeps order actions unavailable even with an order flag',()=>{
  state.enabled=true;
  const {onClick}=mount('/tarif','Ignored');
  const action=screen.getByRole('button');
  expect(action).toHaveAttribute('aria-disabled','true');
  expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
  fireEvent.click(action);expect(onClick).not.toHaveBeenCalled();
 });
 it('uses only the configured action, preserves Button styling and separates status/contact',()=>{
  const {onClick}=mount('/start?lang=de','Hardcoded foreign label');
  const action=screen.getByRole('button',{name:'Configured de i18n.cta_check_savings'});
  expect(action).toHaveAttribute('aria-disabled','true');expect(action).toHaveClass('bg-cta');
  expect(action).toHaveAccessibleDescription('Unavailable · Contact');expect(action).not.toHaveAttribute('tabindex');
  fireEvent.click(action);fireEvent.keyDown(action,{key:'Enter'});expect(onClick).not.toHaveBeenCalled();
  expect(screen.queryByText('Hardcoded foreign label')).toBeNull();
  expect(screen.getByRole('link',{name:'Contact'})).toHaveAttribute('href','mailto:owner@example.test');
 });
 for(const lang of ['de','en','tr','ru','ar','it','zh','hi','es','fr','nl','pl'])for(const path of ['/start','/tarif','/rechnung'])it(`uses configured ${lang} labels for ${path}`,()=>{
  mount(path,'',lang);
  expect(screen.getByRole('button')).toHaveTextContent(`Configured ${lang} ${path==='/rechnung'?'sections.jahresrechnung.cta':'i18n.cta_check_savings'}`);
 });
 it('omits an empty button and exposes readiness when label config is missing',()=>{
  state.missing=true;const {container}=mount('/start','Jetzt Ersparnis prüfen');
  expect(screen.queryByRole('button')).toBeNull();expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
  expect(container.querySelector('[data-copy-readiness="MISSING_LABEL"]')).toBeInTheDocument();
  expect(screen.queryByText('Jetzt Ersparnis prüfen')).toBeNull();
 });
 it.each(['de','en','ar'])('keeps the funnel disabled without technical or fallback copy when availability is absent (%s)',lang=>{
  state.missingAvailability=true;state.missingContact=true;
  const {container,onClick}=mount('/start','Hardcoded German fallback',lang);
  const action=screen.getByRole('button',{name:`Configured ${lang} i18n.cta_check_savings`});
  expect(action).toHaveAttribute('aria-disabled','true');
  expect(action).not.toHaveAttribute('aria-describedby');
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  expect(container.textContent).not.toMatch(/NOT_READY|Unavailable|Contact|Hardcoded German fallback/);
  expect(container.querySelector('[data-transport="NOT_READY"]')).toBeInTheDocument();
  fireEvent.click(action);fireEvent.keyDown(action,{key:'Enter'});expect(onClick).not.toHaveBeenCalled();
 });
 it('uses configured contact alone without a technical prefix or dangling separator',()=>{
  state.missingAvailability=true;
  mount('/rechnung','Ignored','en');
  expect(screen.getByRole('status')).toHaveTextContent(/^Contact$/);
  expect(screen.getByRole('button')).toHaveAccessibleDescription('Contact');
  expect(screen.getByRole('link',{name:'Contact'})).toHaveAttribute('href','mailto:owner@example.test');
  expect(document.body.textContent).not.toContain('NOT_READY');
 });
 it('renders no empty action or technical status when all customer copy is absent',()=>{
  state.missing=true;state.missingAvailability=true;state.missingContact=true;
  const {container}=mount('/tarif','German fallback','en');
  expect(container.textContent).toBe('');expect(screen.queryByRole('button')).toBeNull();
  expect(screen.queryByRole('status')).toBeNull();expect(screen.queryByRole('link')).toBeNull();
  expect(container.querySelector('[data-copy-readiness="MISSING_LABEL"]')).toBeInTheDocument();
 });
 it('leaves Ehiogie navigation, children and click behavior untouched without availability copy',()=>{
  state.customer=false;state.missingAvailability=true;state.missingContact=true;
  const {onClick}=mount('/start','Ehiogie original CTA','en');
  const link=screen.getByRole('link',{name:'Ehiogie original CTA'});
  expect(link).toHaveAttribute('href','/start');expect(link).not.toHaveAttribute('aria-disabled');
  expect(link).not.toHaveAttribute('aria-describedby');fireEvent.click(link);expect(onClick).toHaveBeenCalledOnce();
 });
 it('uses an explicit configured section label path',()=>{
  render(<MemoryRouter><I18nProvider><MarketingLink to="/start" labelPath="sections.hero.cta_text">Ignored</MarketingLink></I18nProvider></MemoryRouter>);
  expect(screen.getByRole('button',{name:'Configured de sections.hero.cta_text'})).toBeInTheDocument();
 });
 it('does not use a pending-translation notice as a label',()=>{
  mount('/start','Diese Übersetzung wird vorbereitet.');
  expect(screen.queryByText('Diese Übersetzung wird vorbereitet.')).toBeNull();
 });
 it('preserves working non-funnel navigation and anchor refs',()=>{
  const ref=createRef<HTMLAnchorElement>();render(<MemoryRouter><I18nProvider><MarketingLink ref={ref} to="/jahresrechnung">Annual</MarketingLink></I18nProvider></MemoryRouter>);
  expect(ref.current).toBe(screen.getByRole('link',{name:'Annual'}));
 });
 it('keeps reference funnel navigation unchanged',()=>{
  state.customer=false;mount('/start','Check');expect(screen.getByRole('link',{name:'Check'})).toHaveAttribute('href','/start');
 });
});
