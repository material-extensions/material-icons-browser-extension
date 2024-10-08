import { CSSProperties } from 'react';

export function NotSupported() {
  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    padding: '0 2rem',
    boxSizing: 'border-box',
    fontSize: '1rem',
    lineHeight: '1.5',
  };
  return (
    <div className='not-supported' style={containerStyles}>
      <h2>Not Supported</h2>
      <p>
        This page is not supported by the extension. You can still use the
        extension on other pages.
      </p>
    </div>
  );
}
