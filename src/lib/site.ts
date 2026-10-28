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

/**
 * Live totals for the impact counter (GET -> { mensajes, leads, visitas,
 * actualizado }). Served by the n8n flow "[Web] Cifras públicas". Until that
 * flow is active the request fails and ImpactCounter renders nothing, so no
 * number ever appears that did not come from the database.
 */
export const STATS_WEBHOOK_URL = `${N8N_ORIGIN}/webhook/web-cifras`;

/**
 * The instant demo: a visitor enters their own site and talks to an agent
 * built from it. `o` is the channel the team sees in the demos panel, so
 * every demo button on this site says where it came from.
 */
export const demoUrl = (origin: "web" | "contacto" = "web") =>
  `https://demo.simpliaspain.com/?o=${origin}`;

/** 15-minute strategy call (Cal.com). */
export const CALL_URL = "https://reservas.simpliaspain.com/simpliaspain/llamadaestrategia";

/**
 * Two numbers on two levels: the main one wherever a phone is shown, the
 * alternative only beside it, smaller. Keep the main one identical to the
 * Google Business profile and LinkedIn.
 */
export const PHONE_MAIN = { display: "+34 601 755 607", href: "tel:+34601755607" };
export const PHONE_ALT = { display: "+34 608 445 993", href: "tel:+34608445993" };

export const EMAIL = "info@simpliaspain.com";

export const SOCIAL_LINKS = [
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/simplia-spain/" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/simpliaspain/" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@simpliaspain" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@simplia-spain" },
] as const;
