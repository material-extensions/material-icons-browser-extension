import { Domain } from '@/models';
import { getGitProviders } from '@/providers';

export function getDomains(): Promise<Domain[]> {
  return getGitProviders().then((providers) => [
    { name: 'default', isCustom: false },
    ...Object.values(providers).flatMap((p) =>
      p.domains.map((d) => ({ name: d.host, isCustom: p.isCustom }))
    ),
  ]);
}
