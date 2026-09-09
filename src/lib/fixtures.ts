import type { RiskBand } from "./types.ts";

export type FixtureExpectation = {
  id: string;
  input: string;
  title: string;
  minBand: RiskBand;
  maxBand: RiskBand;
  mustDetect?: string[];
  mustNotDetect?: string[];
  mustBlockFetch?: boolean;
  notes: string;
};

export const BAND_ORDER: RiskBand[] = ["LOW", "GUARDED", "MEDIUM", "HIGH", "CRITICAL"];

export function bandInRange(actual: RiskBand, min: RiskBand, max: RiskBand): boolean {
  const i = BAND_ORDER.indexOf(actual);
  return i >= BAND_ORDER.indexOf(min) && i <= BAND_ORDER.indexOf(max);
}

export const FIXTURES: FixtureExpectation[] = [
  {
    id: "safe-example",
    input: "https://example.com",
    title: "Clean public site",
    minBand: "LOW",
    maxBand: "LOW",
    mustNotDetect: ["typosquat", "ip-literal", "ssrf", "javascript-scheme"],
    notes: "Baseline safe URL.",
  },
  {
    id: "shortener",
    input: "https://bit.ly/3example",
    title: "Known shortener",
    minBand: "GUARDED",
    maxBand: "HIGH",
    mustDetect: ["shortener"],
    notes: "Shortener alone is not proof of malice.",
  },
  {
    id: "paypal-typosquat",
    input: "https://paypa1.com/login",
    title: "PayPal lookalike with login path",
    minBand: "HIGH",
    maxBand: "CRITICAL",
    mustDetect: ["typosquat", "login-path"],
    notes: "Digit substitution on a payment brand plus a credential path.",
  },
  {
    id: "ip-literal-login",
    input: "http://203.0.113.50/login",
    title: "Documentation-net IP literal login",
    minBand: "HIGH",
    maxBand: "CRITICAL",
    mustDetect: ["ip-literal", "no-tls", "login-path"],
    mustNotDetect: ["ssrf"],
    notes: "TEST-NET-3 is not a private SSRF target.",
  },
  {
    id: "ssrf-private",
    input: "http://192.168.1.10/admin",
    title: "Private IP SSRF reject",
    minBand: "HIGH",
    maxBand: "CRITICAL",
    mustDetect: ["ssrf", "ip-literal"],
    mustBlockFetch: true,
    notes: "Must not be fetched.",
  },
  {
    id: "brand-as-subdomain",
    input: "https://paypal.com.secure-login.tk/signin",
    title: "Brand buried in a foreign registrable domain",
    minBand: "CRITICAL",
    maxBand: "CRITICAL",
    mustDetect: ["brand-in-subdomain", "suspicious-tld", "login-path"],
    notes: "paypal.com is not the registrable domain here.",
  },
  {
    id: "punycode-homograph",
    input: "https://xn--pypal-4ve.com/",
    title: "Punycode homograph",
    minBand: "HIGH",
    maxBand: "CRITICAL",
    mustDetect: ["homograph"],
    notes: "IDN encoded lookalike of a payment brand.",
  },
  {
    id: "javascript-scheme",
    input: "javascript:alert(1)",
    title: "javascript: scheme block",
    minBand: "CRITICAL",
    maxBand: "CRITICAL",
    mustDetect: ["javascript-scheme"],
    mustBlockFetch: true,
    notes: "Never resolve or execute.",
  },
  {
    id: "official-github-login",
    input: "https://github.com/login",
    title: "Official GitHub login",
    minBand: "LOW",
    maxBand: "GUARDED",
    mustNotDetect: ["typosquat", "brand-in-subdomain"],
    notes: "Login path on a curated official host is not typosquat.",
  },
  {
    id: "official-google-accounts",
    input: "https://accounts.google.com",
    title: "Official Google accounts",
    minBand: "LOW",
    maxBand: "LOW",
    mustNotDetect: ["typosquat", "brand-in-subdomain", "suspicious-tld"],
    notes: "accounts.google.com is an official-brand host.",
  },
];

export type CompatFixture = FixtureExpectation & {
  url: string;
  expectIds?: string[];
  rejectIds?: string[];
  expectBandMin?: RiskBand;
};

export const COMPAT_FIXTURES: CompatFixture[] = FIXTURES.map((fx) => ({
  ...fx,
  url: fx.input,
  expectIds: fx.mustDetect,
  rejectIds: fx.mustNotDetect,
  expectBandMin: fx.minBand,
}));
