export function DomainName({ domain }: { domain: string }) {
  return (
    <div style={{ padding: '1rem' }}>
      <sub>Current domain:</sub>
      <h3>{domain}</h3>
    </div>
  );
}
