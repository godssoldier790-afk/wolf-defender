export type Brand = { name: string; tokens: string[]; suffixes: string[] };

export const BRANDS: Brand[] = [
  { name: "PayPal", tokens: ["paypal", "paypa1", "paypai"], suffixes: ["paypal.com"] },
  { name: "Apple", tokens: ["apple", "app1e"], suffixes: ["apple.com", "icloud.com"] },
  { name: "Google", tokens: ["google", "gooogle", "g00gle"], suffixes: ["google.com", "youtube.com", "gmail.com"] },
  { name: "Microsoft", tokens: ["microsoft", "micr0soft"], suffixes: ["microsoft.com", "live.com", "office.com", "outlook.com"] },
  { name: "Amazon", tokens: ["amazon", "amaz0n"], suffixes: ["amazon.com"] },
  { name: "Meta", tokens: ["facebook", "instagram", "whatsapp"], suffixes: ["meta.com", "facebook.com", "instagram.com", "whatsapp.com"] },
  { name: "Binance", tokens: ["binance"], suffixes: ["binance.com"] },
  { name: "Coinbase", tokens: ["coinbase"], suffixes: ["coinbase.com"] },
  { name: "MetaMask", tokens: ["metamask"], suffixes: ["metamask.io"] },
  { name: "GitHub", tokens: ["github"], suffixes: ["github.com", "githubusercontent.com"] },
];

export function isOfficialHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return BRANDS.some((brand) => brand.suffixes.some((suffix) => host === suffix || host.endsWith("." + suffix)));
}
