/// <reference types="vite/client" />

interface Window {
  WEBSITE_LOADER_BOOTSTRAP?: import("./lib/websiteRuntime").BootstrapConfig;
  TB_BOOTSTRAP?: import("./lib/websiteRuntime").BootstrapConfig;
}
