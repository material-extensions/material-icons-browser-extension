export function getUrl(urlOrDomain: string): URL {
  return new URL(
    urlOrDomain.startsWith('http') ? urlOrDomain : `https://${urlOrDomain}`
  );
}

export function getExtensionOriginPattern(urlOrDomain: string): string {
  const { hostname } = getUrl(urlOrDomain);

  return `*://${hostname}/*`;
}

export function getProviderMatchDomains(urlOrDomain: string): string[] {
  const { host, hostname } = getUrl(urlOrDomain);

  return Array.from(new Set([host, hostname]));
}
