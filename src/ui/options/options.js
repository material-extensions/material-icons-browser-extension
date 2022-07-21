import { getConfig, setConfig, clearConfig, onConfigChange } from '../../lib/userConfig';
import { providerConfig } from '../../providers';

const resetButton = document.getElementById('reset')

const newDomainRow = () => {
  const template = document.getElementById('domain-row');
  if (template instanceof HTMLTemplateElement) {
    const row = template.content.firstElementChild.cloneNode(true);
    return row;
  }
  throw new Error('No row template found');
};

/**
 *
 * @param {HTMLElement} row
 * @param {string} domain
 */
const fillRow = (row, domain) => {
  row.id = `row-${domain}`

  const title = row.getElementsByClassName('domain-name').item(0)
  title.appendChild(document.createTextNode(domain))

  // const checkbox = row.getElementsByClassName('domain-enabled').item(0)
  // checkbox.setAttribute('checked', true)
  // checkbox.setAttribute('disabled', true)

  if (domain === 'default') {
    [...row.getElementsByClassName('default-option')].forEach(opt => opt.remove())
  }

  const wireConfig = (config) => {
    const select = row.getElementsByClassName(config).item(0)

    const updateSelect = val => {select.value = val ?? 'default'}
    const updateConfig = ({target: {value}}) => (!value || value === '(default)') ? clearConfig(config, domain) : setConfig(config, value, domain)

    const populateSelect = () => getConfig(config, domain, false).then(updateSelect)

    select.addEventListener('change', updateConfig);
    onConfigChange(config, updateSelect, domain);
    onConfigChange(config, () => getConfig(config, domain, false).then(updateSelect), 'default');
    resetButton.addEventListener('click', () => clearConfig(config, domain).then(populateSelect));

    [...select.getElementsByClassName('default-option')].forEach(opt => {
      select.addEventListener('focus', () => opt.text = '(default)')
      select.addEventListener('blur', () => opt.text = '')
    })

    return populateSelect()
  }

  return Promise.all([wireConfig('iconSize'), wireConfig('iconPack') ]).then(() => row)
}

const domainsDiv = document.getElementById('domains');
const domains = ['default', ...Object.values(providerConfig).map(p => p.domain)]
Promise.all(domains.map(d => fillRow(newDomainRow(), d)))
.then(rows => rows.forEach(r => domainsDiv.appendChild(r)))



/**
 * todo:
 * selectors to set all domains
 * enable/disable checkbox
 */
