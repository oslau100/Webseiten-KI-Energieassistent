import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import { resolveCustomerArray, resolveLocalizedText } from '@/lib/websiteContentResolver';
import { Testimonials } from './Testimonials';
import { Stats } from './Stats';
const state=vi.hoisted(()=>({content:{} as Record<string,unknown>}));
vi.mock('@/lib/websiteConfig',()=>({useWebsiteConfig:()=>({customerRuntime:true,content:state.content,getText:(path:string,_fallback:string,lang='de')=>resolveLocalizedText(state.content,path,'',lang,false),getArray:(path:string)=>resolveCustomerArray(state.content,path)})}));
afterEach(()=>{vi.restoreAllMocks();localStorage.clear();});
const mount=(ui:React.ReactNode)=>render(<MemoryRouter><I18nProvider>{ui}</I18nProvider></MemoryRouter>);
describe('configured customer proof values',()=>{
 it('renders the configured rating and never assumes five stars or adds demo labels',()=>{
  state.content={sections:{testimonials:{home_reviews:{de:[{name:'Configured author',title:'Configured review',text:'Configured text',rating:2}]}}}};
  mount(<Testimonials/>);
  expect(screen.getByRole('img',{name:'2/5'}).querySelectorAll('svg')).toHaveLength(2);
  expect(screen.getByText('Configured author')).toBeInTheDocument();
  expect(screen.queryByRole('img',{name:'5/5'})).toBeNull();
  expect(document.body.textContent).not.toMatch(/Demo|Platzhalter|Prüfkennzeichnung/);
 });
 it('omits unspecified stars while retaining an existing review',()=>{
  state.content={sections:{testimonials:{home_reviews:{de:[{name:'Configured author',title:'Existing review',text:'Configured text'}]}}}};
  mount(<Testimonials/>);expect(screen.getByText('Existing review')).toBeInTheDocument();expect(screen.queryByRole('img')).toBeNull();
 });
 it('shows configured end metrics immediately for reduced motion',()=>{
  vi.spyOn(window, 'matchMedia').mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()} as unknown as MediaQueryList);
  state.content={sections:{stats:{items:{de:[{end:1234,suffix:' €',label:'Configured metric'}]}}}};
  mount(<Stats/>);expect(screen.getAllByText('1.234 €')).toHaveLength(2);expect(screen.getByText('Configured metric')).toBeInTheDocument();
  expect(screen.queryByText(/900.000|15.000/)).toBeNull();
 });
 it('keeps absent customer reviews and metrics empty rather than using reference proof data',()=>{
  state.content={};const{container}=mount(<><Testimonials/><Stats/></>);expect(container.querySelector('section')).toBeNull();
 });
});
