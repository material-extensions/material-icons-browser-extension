/* eslint-disable no-param-reassign */
import { getConfig, setConfig, clearConfig, onConfigChange } from '../../lib/userConfig';
import { providerConfig } from '../../providers';

const resetButton = document.getElementById('reset');

const newDomainRow = () => {
  const template = document.getElementById('domain-row');
  if (template instanceof HTMLTemplateElement) {
    const row = template.content.firstElementChild.cloneNode(true);
    return row;
  }
  throw new Error('No row template found');
};

/**
 * @param {HTMLElement} row
 */
const domainToggles = (row) => {
  if (row.id === 'row-default') return;

  const toggleRow = (allEnabled) => {
    const checkbox = row.querySelectorAll('.extEnabled').item(0);
    if (checkbox instanceof HTMLInputElement) {
      checkbox.disabled = !allEnabled;
      checkbox.indeterminate = !allEnabled;
    }
    if (allEnabled) row.classList.remove('disabled');
    else row.classList.add('disabled');
  };

  getConfig('extEnabled', 'default').then(toggleRow);
  onConfigChange('extEnabled', toggleRow, 'default');
};

/**
 * @param {HTMLElement} row
 * @param {string} domain
 */
const fillRow = (row, domain) => {
  row.id = `row-${domain}`;

  const title = row.getElementsByClassName('domain-name').item(0);
  title.appendChild(document.createTextNode(domain));

  if (domain === 'default') {
    [...row.getElementsByClassName('default-option')].forEach((opt) => opt.remove());
  }

  resetButton.addEventListener('click', () => {
    row.classList.add('brightDomain');
    setTimeout(() => row.classList.add('animated'), 0);
    setTimeout(() => row.classList.remove('brightDomain'), 0);
    setTimeout(() => row.classList.remove('animated'), 800);
  });

  const wireConfig = (config, updateInput, updateConfig) => {
    const input = row.getElementsByClassName(config).item(0);

    const populateInput = () => getConfig(config, domain, false).then(updateInput(input));

    input.addEventListener('change', updateConfig(config));
    onConfigChange(config, updateInput(input), domain);
    onConfigChange(
      config,
      () => getConfig(config, domain, false).then(updateInput(input)),
      'default'
    );
    resetButton.addEventListener('click', () => clearConfig(config, domain).then(populateInput));

    [...input.getElementsByClassName('default-option')].forEach((opt) => {
      input.addEventListener('focus', () => {
        opt.text = '(default)';
      });
      input.addEventListener('blur', () => {
        opt.text = '';
      });
    });

    return populateInput();
  };

  const updateSelect = (input) => (val) => {
    input.value = val ?? 'default';
  };
  const updateConfigFromSelect =
    (config) =>
    ({ target: { value } }) =>
      !value || value === '(default)'
        ? clearConfig(config, domain)
        : setConfig(config, value, domain);
  const wireSelect = (config) => wireConfig(config, updateSelect, updateConfigFromSelect);

  const updateCheck = (input) => (val) => {
    input.checked = val ?? true;
  };
  const updateConfigFromCheck =
    (config) =>
    ({ target: { checked } }) =>
      setConfig(config, checked, domain);
  const wireCheck = (config) => wireConfig(config, updateCheck, updateConfigFromCheck);

  return Promise.all([wireSelect('iconSize'), wireSelect('iconPack'), wireCheck('extEnabled')])
    .then(() => domainToggles(row))
    .then(() => row);
};

const domainsDiv = document.getElementById('domains');
const domains = ['default', ...Object.values(providerConfig).map((p) => p.domain)];
Promise.all(domains.map((d) => fillRow(newDomainRow(), d))).then((rows) =>
  rows.forEach((r) => domainsDiv.appendChild(r))
);
