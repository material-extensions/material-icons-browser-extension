import { describe, expect, it, vi } from 'vitest';
import { Provider } from '../models';
import { replaceElementWithIcon } from './replace-icon';

const { sendMessage } = vi.hoisted(() => ({
  sendMessage: vi.fn(
    async ({ iconName }: { iconName: string }) =>
      `data:image/svg+xml,${iconName}`
  ),
}));

vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      getURL: (name: string) => `safari-web-extension://test-id/${name}`,
      sendMessage,
    },
  },
}));

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('replaceElementWithIcon on Safari', () => {
  it('uses cached data: URLs instead of extension URLs', async () => {
    const provider = { replaceIcon: vi.fn() } as unknown as Provider;
    const a = document.createElement('svg');
    const b = document.createElement('svg');

    replaceElementWithIcon(a, 'ts.svg', 'a.ts', provider);
    replaceElementWithIcon(b, 'ts.svg', 'b.ts', provider);
    await flush();

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(provider.replaceIcon).toHaveBeenCalledTimes(2);
    const img = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('data:image/svg+xml,ts.svg');
  });

  it('ignores a stale icon when a newer one was requested', async () => {
    const provider = { replaceIcon: vi.fn() } as unknown as Provider;
    const el = document.createElement('svg');

    replaceElementWithIcon(el, 'folder.svg', 'src', provider);
    replaceElementWithIcon(el, 'folder-open.svg', 'src', provider);
    await flush();

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const img = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('data:image/svg+xml,folder-open.svg');
  });
});
