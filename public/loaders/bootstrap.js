// Validate standalone loader bootstraps as well as values passed by the SPA.
// No query parameter can select a tenant on these production static assets.
(() => {
  const bootstrap = window.TB_BOOTSTRAP || {};
  const locationId = typeof bootstrap.locationId === "string" ? bootstrap.locationId.trim() : "";
  bootstrap.locationId = /^[A-Za-z0-9_-]{1,128}$/.test(locationId) && !/^(secret|placeholder|undefined|null)$/i.test(locationId) ? locationId : "";
  const key = typeof bootstrap.supabaseKey === "string" ? bootstrap.supabaseKey.trim() : "";
  let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  try {
    if (/^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) {
      publicKey = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role === "anon";
    }
  } catch { publicKey = false; }
  bootstrap.supabaseKey = publicKey ? key : "";
  window.TB_BOOTSTRAP = bootstrap;
})();
