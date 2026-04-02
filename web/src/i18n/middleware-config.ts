import { routing } from "./routing";

export function getIntlMiddlewareRouting() {
  return {
    ...routing,
    alternateLinks: false,
  };
}
