import { getGitProviders } from '@/providers';

export function getDomains(): Promise<string[]> {
  return getGitProviders().then((providers) => [
    'default',
    ...Object.values(providers).flatMap((p) => p.domains.map((d) => d.host)),
  ]);
}
