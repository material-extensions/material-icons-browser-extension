import {
  UserConfig,
  addConfigChangeListener,
  clearConfig,
  getConfig,
  setConfig,
} from '@/lib/user-config';
import { getGitProviders } from '@/providers';

const resetButton = document.getElementById(
  'reset'
) as HTMLButtonElement | null;

interface DomainRowElement extends HTMLElement {
  id: string;
}

export const newDomainRow = (): ChildNode => {
  const template = document.getElementById('domain-row');
  if (template instanceof HTMLTemplateElement) {
    const row = template.content.firstElementChild?.cloneNode(true);
    if (!row) throw new Error('Row clone failed');
    return row as ChildNode;
  }
  throw new Error('No row template found');
};

const domainToggles = (row: DomainRowElement): void => {
  if (row.id === 'row-default') return;

  const toggleRow = (allEnabled: boolean): void => {
    const checkbox = row.querySelector(
      '.extEnabled'
    ) as HTMLInputElement | null;
    if (checkbox) {
      checkbox.disabled = !allEnabled;
      checkbox.indeterminate = !allEnabled;
    }
    if (allEnabled) row.classList.remove('disabled');
    else row.classList.add('disabled');
  };

  getConfig<boolean>('extEnabled', 'default').then(toggleRow);
  addConfigChangeListener('extEnabled', toggleRow, 'default');
};

export const fillRow = (
  rowElement: ChildNode,
  domain: string
): Promise<DomainRowElement> => {
  const row = rowElement as DomainRowElement;
  row.id = `row-${domain}`;

  const title = row.querySelector('.domain-name');
  if (title) title.appendChild(document.createTextNode(domain));

  if (domain === 'default') {
    row.querySelectorAll('.default-option').forEach((opt) => opt.remove());
  }

  resetButton?.addEventListener('click', () => {
    row.classList.add('brightDomain');
    setTimeout(() => row.classList.add('animated'), 0);
    setTimeout(() => row.classList.remove('brightDomain'), 0);
    setTimeout(() => row.classList.remove('animated'), 800);
  });

  const wireConfig = <T>(
    configName: keyof UserConfig,
    updateInput: (input: HTMLElement) => (val: T) => void,
    updateConfig: (configName: keyof UserConfig) => (event: Event) => void
  ): Promise<void> => {
    const input = row.querySelector(`.${configName}`) as HTMLElement;

    const populateInput = (): Promise<void> =>
      getConfig<T>(configName, domain, false).then(updateInput(input));

    input.addEventListener('change', updateConfig(configName));
    addConfigChangeListener(configName, updateInput(input), domain);
    addConfigChangeListener(
      configName,
      () => getConfig<T>(configName, domain, false).then(updateInput(input)),
      'default'
    );
    resetButton?.addEventListener('click', () =>
      clearConfig(configName, domain).then(populateInput)
    );

    input.querySelectorAll('.default-option').forEach((opt) => {
      input.addEventListener('focus', () => {
        (opt as HTMLOptionElement).text = '(default)';
      });
      input.addEventListener('blur', () => {
        (opt as HTMLOptionElement).text = '';
      });
    });

    return populateInput();
  };

  const updateSelect = (input: HTMLElement) => (val?: string) => {
    (input as HTMLSelectElement).value = val ?? 'default';
  };
  const updateConfigFromSelect =
    (configName: keyof UserConfig) =>
    ({ target }: Event) => {
      const value = (target as HTMLSelectElement).value;
      return !value || value === '(default)'
        ? clearConfig(configName, domain)
        : setConfig(configName, value, domain);
    };
  const wireSelect = (configName: keyof UserConfig) =>
    wireConfig(configName, updateSelect, updateConfigFromSelect);

  const updateCheck = (input: HTMLElement) => (val?: boolean) => {
    (input as HTMLInputElement).checked = val ?? true;
  };
  const updateConfigFromCheck =
    (configName: keyof UserConfig) =>
    ({ target }: Event) => {
      const checked = (target as HTMLInputElement).checked;
      return setConfig(configName, checked, domain);
    };
  const wireCheck = (configName: keyof UserConfig) =>
    wireConfig(configName, updateCheck, updateConfigFromCheck);

  return Promise.all([
    wireSelect('iconSize'),
    wireSelect('iconPack'),
    wireCheck('extEnabled'),
  ])
    .then(() => domainToggles(row))
    .then(() => row);
};

export function getDomains(): Promise<string[]> {
  return getGitProviders().then((providers) => [
    'default',
    ...Object.values(providers).flatMap((p) => p.domains.map((d) => d.host)),
  ]);
}

export const domainsDiv = document.getElementById('domains') as HTMLDivElement;
