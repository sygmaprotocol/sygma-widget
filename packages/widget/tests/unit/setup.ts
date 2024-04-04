//remove annoying lit warnings
const warn = console.warn;
console.warn = (...msg) => {
  if (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    !msg[0]?.includes('Lit is in dev mode') &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    !msg[0]?.includes('change-in-update')
  ) {
    warn(...msg);
  }
};
