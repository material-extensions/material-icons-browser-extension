const logo = require('./../../logo.svg') as string;

export function Logo() {
  return <img src={logo} height={25} width={25} />;
}
