export function IconPreview({
  configName,
  iconName,
}: { configName: string; iconName?: string }) {
  const getIconSrc = (iconName?: string) => {
    if (configName === 'folderIconBindings') {
      return iconName === 'folder' ? 'folder' : `folder-${iconName}`;
    }
    return iconName;
  };

  if (!iconName) {
    return null;
  }

  return (
    <img
      loading='lazy'
      width='20'
      src={`./${getIconSrc(iconName)?.toLowerCase()}.svg`}
      alt=''
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // Prevent infinite loop in case the fallback also fails
        target.src = `./${getIconSrc(iconName)?.toLowerCase()}.clone.svg`;
      }}
    />
  );
}
