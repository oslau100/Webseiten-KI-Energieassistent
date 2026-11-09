/**
 * DRAFT only: Cloudflare Pages Function for oecher-strom-v1.
 * Must be copied to the WEBSITE repository's /functions/api/v1/setting.ts
 * only after separate website-change approval.
 * The tenant is intentionally a constant, never chosen by request metadata.
 */
import { handlePinnedV1SettingRequest, type RelayEnvironment } from "../../_shared/v1-tariff-relay.ts";

const OECHER_V1_LOCATION_ID = "uuDEvEGcyd3mMiKWKH4Z";

type PagesContext = { request: Request; env: RelayEnvironment };

export async function onRequestPost(context: PagesContext): Promise<Response> {
  return handlePinnedV1SettingRequest(context.request, context.env, OECHER_V1_LOCATION_ID);
}
