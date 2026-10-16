import {render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {I18nProvider,useI18n} from './i18n';
const state=vi.hoisted(()=>({content:{} as Record<string,unknown>}));
vi.mock('./websiteConfig',()=>({useWebsiteConfig:()=>({customerRuntime:true,content:state.content})}));
afterEach(()=>localStorage.clear());
const keys=['hero_headline','annual_hero_h1','header_check_bill','cta_check_savings','footer_contact','footer_callback'];
function Probe(){const {t,lang}=useI18n();return <output data-testid="values">{JSON.stringify({lang,values:keys.map(t)})}</output>;}
describe('customer marketing catalog boundary',()=>{
 it('does not use German, repository marketing, or a pending notice for missing English values',async()=>{
  state.content={i18n:{hero_headline:{de:'German customer title'}},availability:{translation_pending:{en:'Pending notice'}}};
  render(<MemoryRouter initialEntries={['/?lang=en']}><I18nProvider><Probe/></I18nProvider></MemoryRouter>);
  await waitFor(()=>expect(JSON.parse(screen.getByTestId('values').textContent).lang).toBe('en'));
  expect(JSON.parse(screen.getByTestId('values').textContent).values).toEqual(keys.map(()=>''));
 });
 it('uses the exact selected Location-configured values',()=>{
  state.content={i18n:Object.fromEntries(keys.map(k=>[k,{de:`Configured ${k}`}]))};
  render(<MemoryRouter><I18nProvider><Probe/></I18nProvider></MemoryRouter>);
  expect(JSON.parse(screen.getByTestId('values').textContent).values).toEqual(keys.map(k=>`Configured ${k}`));
 });
});
