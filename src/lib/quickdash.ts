import { createQuickConnect } from "@quickengine/quick/browser";

const config = {
  baseUrl: process.env.NEXT_PUBLIC_QUICKDASH_API_URL,
  siteKey: process.env.NEXT_PUBLIC_QUICKDASH_SITE_KEY,
  workspaceId: process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID,
};

export const quickDashConfigured = Boolean(
  config.baseUrl && config.siteKey && config.workspaceId,
);

export function quickDashClient(customerSession?: string) {
  if (!config.baseUrl || !config.siteKey || !config.workspaceId) {
    throw new Error("QuickDash is not configured for this storefront.");
  }

  return createQuickConnect({
    baseUrl: config.baseUrl,
    workspaceId: config.workspaceId,
    credential: {
      type: "site",
      key: config.siteKey,
      ...(customerSession ? { customerSession } : {}),
    },
  });
}
