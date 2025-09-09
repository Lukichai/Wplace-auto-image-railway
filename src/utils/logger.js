export const log = (msg, obj = undefined) => {
  const ts = new Date().toISOString();
  if (obj !== undefined) console.log(`[${ts}] ${msg}`, obj);
  else console.log(`[${ts}] ${msg}`);
};

export const error = (msg, err = undefined) => {
  const ts = new Date().toISOString();
  if (err) console.error(`[${ts}] ERROR: ${msg}`, err);
  else console.error(`[${ts}] ERROR: ${msg}`);
};
