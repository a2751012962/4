import { readDateMs, makeThumbBlob } from '../album/decode.js';

self.addEventListener('message', async (event) => {
  const { seq, type, file, maxDim } = event.data;
  try {
    if (type === 'prepare') {
      const [dateMs, microBlob] = await Promise.all([
        readDateMs(file),
        makeThumbBlob(file, maxDim || 96, 0.66),
      ]);
      self.postMessage({ seq, ok: true, dateMs, microBlob });
      return;
    }

    if (type === 'texture') {
      const blob = await makeThumbBlob(file, maxDim || 512, 0.82);
      self.postMessage({ seq, ok: true, blob });
      return;
    }

    throw new Error(`unknown worker task: ${type}`);
  } catch (err) {
    self.postMessage({
      seq,
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
});
