const ATTRIBUTE_PREFIX = 'data-material-icons-extension';

export function syncIconMetadata(source: Element, target: Element): void {
  for (const attribute of target.getAttributeNames()) {
    if (attribute.startsWith(ATTRIBUTE_PREFIX)) {
      target.removeAttribute(attribute);
    }
  }

  for (const attribute of source.getAttributeNames()) {
    if (attribute.startsWith(ATTRIBUTE_PREFIX)) {
      target.setAttribute(attribute, source.getAttribute(attribute) ?? '');
    }
  }
}
