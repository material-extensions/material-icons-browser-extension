import { useTheme } from '@mui/material/styles';
import { getIconFileName } from '../../api/icons';

interface IconPreviewProps {
  configName: string;
  iconName?: string;
}

export function IconPreview({ configName, iconName }: IconPreviewProps) {
  const theme = useTheme();
  const getIconSrc = (iconName?: string): string | undefined => {
    if (configName === 'folderIconBindings') {
      return iconName === 'folder' ? 'folder' : `folder-${iconName}`;
    }
    return iconName;
  };

  if (!iconName) {
    return null;
  }

  const iconSrc = getIconSrc(iconName)?.toLowerCase();
  if (!iconSrc) {
    return null;
  }

  return (
    <img
      loading='lazy'
      width='20'
      src={`./${getIconFileName(iconSrc, theme.palette.mode === 'light')}`}
      alt={`${iconName} icon`}
    />
  );
}
