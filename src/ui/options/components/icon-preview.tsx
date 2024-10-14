import { useState, useEffect } from 'react';

export function IconPreview({
  configName,
  iconName,
}: { configName: string; iconName?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  const getIconSrc = (iconName?: string) => {
    if (configName === 'folderIconBindings') {
      return iconName === 'folder' ? 'folder' : `folder-${iconName}`;
    }
    return iconName;
  };

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!iconName) return;

      const baseSrc = `./${getIconSrc(iconName)?.toLowerCase()}.svg`;
      const cloneSrc = `./${getIconSrc(iconName)?.toLowerCase()}.clone.svg`;

      if (await checkImageExists(baseSrc)) {
        setSrc(baseSrc);
      } else if (await checkImageExists(cloneSrc)) {
        setSrc(cloneSrc);
      } else {
        setSrc(null);
      }
    };

    loadImage();
  }, [iconName, configName]);

  if (!src) {
    return null;
  }

  return <img loading='lazy' width='20' src={src} alt='' />;
}
