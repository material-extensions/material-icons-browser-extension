import { getConfig, setConfig } from '../../lib/userConfig';
import { providerConfig } from '../../providers';


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
  // const checkbox = row.getElementsByClassName('domain-enabled').item(0)
  const title = row.getElementsByClassName('domain-name').item(0)
  const iconSizeSelect = row.getElementsByClassName('domain-icon-size').item(0)
  const iconPackSelect = row.getElementsByClassName('domain-icon-pack').item(0)

  title.appendChild(document.createTextNode(domain))
  // checkbox.setAttribute('checked', true)
  // checkbox.setAttribute('disabled', true)

  iconSizeSelect.addEventListener('change', ({target: {value}}) => setConfig('iconSize', value, domain))
  iconPackSelect.addEventListener('change', ({target: {value}}) => setConfig('iconPack', value, domain))

  return Promise.all([
    getConfig('iconSize', domain).then(size => {iconSizeSelect.value = size}),
    getConfig('iconPack', domain).then(pack => {iconPackSelect.value = pack}),
  ]).then(() => row)
}

const domainsDiv = document.getElementById('domains');
const domains = Object.values(providerConfig).map(p => p.domain)
Promise.all(domains.map(d => fillRow(newDomainRow(), d)))
.then(rows => rows.forEach(r => domainsDiv.appendChild(r)))



/**
 * todo:
 * selectors to set all domains
 * enable/disable checkbox
 * listen to config changes.
 */
