/** Canonical origin of the public site. The apex domain 301-redirects here. */
export const SITE_URL = "https://www.simpliaspain.com";

/*
 * The n8n server behind the chat widget and the contact form, in one place.
 * It moved once, and the old host, hardcoded in two files, silently
 * swallowed every chat message and form submission for three weeks.
 * tests/stale-hosts.spec.ts fails the suite if a retired host reappears
 * anywhere in the source.
 */
const N8N_ORIGIN = "https://simpliaspain-n8n.mruvi8.easypanel.host";

/** Chat widget webhook (POST { chatInput, sessionId } -> { output }). */
export const CHAT_WEBHOOK_URL = `${N8N_ORIGIN}/webhook/e24ccda7-a864-44b8-ad5d-d182e1cd0af2/chat`;

/** Contact form webhook (POST the lead -> { success: true }). */
export const FORM_LEAD_WEBHOOK_URL = `${N8N_ORIGIN}/webhook/form-lead`;
