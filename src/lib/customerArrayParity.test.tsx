import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { WebsiteConfigProvider, useWebsiteConfig } from './websiteConfig';
import { I18nProvider } from './i18n';
import { Problem } from '@/components/Problem';
import { customerRuntimeBindings } from './customerRuntime';
const items=Array.from({length:4},(_,i)=>({title:`Configured problem ${i}`,description:`Configured explanation ${i}`}));
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllEnvs();delete window.TB_BOOTSTRAP;localStorage.clear();});
const ConfigState=()=>{const {loading}=useWebsiteConfig();return <output data-testid='config-loading'>{String(loading)}</output>;};
describe('customer array rendering without foreign source fallbacks',()=>{
 for(const {locationId}of customerRuntimeBindings)for(const lang of ['de','en','ar'])it(`renders only the supplied ${lang} cards for ${locationId}`,async()=>{
  vi.stubEnv('VITE_LOCATION_ID',locationId);vi.stubEnv('DEV',true);
  window.TB_BOOTSTRAP={locationId,supabaseUrl:'https://config.example.test',supabaseKey:'sb_publishable_fixture'};
  vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify([{location_id:locationId,
   webseite_content_config:{brand:{name:'Tenant'},legal:{ready:true,variables:{firma:'Tenant',email:'tenant@example.test'}},sections:{problem:{items}}},
   webseite_design_config:{assets:{logo_header:'/logo.svg',logo_footer:'/logo.svg',hero_image:'/hero.png'}},webseite_layout_config:{pages:{}}
  }])));
  const {container}=render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}><WebsiteConfigProvider><I18nProvider><ConfigState/><Problem/></I18nProvider></WebsiteConfigProvider></MemoryRouter>);
  await waitFor(()=>expect(screen.getByTestId('config-loading')).toHaveTextContent('false'));
  expect(globalThis.fetch).toHaveBeenCalledOnce();
  // Provider resolution is asynchronous. A German probe confirms the actual ready render.
  if(lang==='de'){
   expect(await screen.findByText('Configured problem 0')).toBeInTheDocument();
   expect(container.querySelectorAll('h3')).toHaveLength(4);
  }else{
   expect(container.querySelectorAll('h3')).toHaveLength(0);
  }
  expect(container.textContent).not.toContain('Der Markt ist schwer zu überblicken');
 });
});
