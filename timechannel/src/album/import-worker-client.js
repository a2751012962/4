import exifr from 'exifr';

/* file:// 下浏览器禁止创建 Worker（双击 index.html 直接玩的场景），
   退回主线程执行同样的解码逻辑。 */
const WORKERS_USABLE = location.protocol !== 'file:';

const DATE_KEYS = ['DateTimeOriginal', 'CreateDate', 'ModifyDate'];

async function readDateMsLocal(file) {
  try {
    const meta = await exifr.parse(file, DATE_KEYS);
    const date = meta?.DateTimeOriginal || meta?.CreateDate || meta?.ModifyDate;
    if (date) return new Date(date).getTime();
  } catch (_) {}
  return file.lastModified || Date.now();
}

async function makeThumbBlobLocal(file, maxDim, quality) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width || 1, bitmap.height || 1));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/jpeg', quality });
}

async function mainThread(type, { file, maxDim }) {
  if (type === 'prepare') {
    const [dateMs, microBlob] = await Promise.all([
      readDateMsLocal(file),
      makeThumbBlobLocal(file, maxDim || 96, 0.66),
    ]);
    return { ok: true, dateMs, microBlob };
  }
  if (type === 'texture') {
    return { ok: true, blob: await makeThumbBlobLocal(file, maxDim || 512, 0.82) };
  }
  throw new Error(`unknown worker task: ${type}`);
}

const WORKER_COUNT = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));

let seq = 0;
const workers = [];
const idle = [];
const queue = [];
const inflight = new Map();

function ensureWorkers() {
  if (workers.length || !WORKERS_USABLE) return;
  for (let i = 0; i < WORKER_COUNT; i++) {
    const worker = new Worker(new URL('../workers/import.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => finish(worker, event.data);
    worker.onerror = (event) => failWorker(worker, event.message || 'worker error');
    workers.push(worker);
    idle.push(worker);
  }
}

function finish(worker, data) {
  const job = inflight.get(data.seq);
  if (!job) return;
  inflight.delete(data.seq);
  idle.push(worker);
  if (data.ok) job.resolve(data);
  else job.reject(new Error(data.error || 'worker task failed'));
  pump();
}

function failWorker(worker, message) {
  for (const [id, job] of inflight) {
    if (job.worker === worker) {
      inflight.delete(id);
      job.reject(new Error(message));
    }
  }
  const idx = workers.indexOf(worker);
  if (idx >= 0) workers.splice(idx, 1);
  const idleIdx = idle.indexOf(worker);
  if (idleIdx >= 0) idle.splice(idleIdx, 1);
  try { worker.terminate(); } catch (_) {}
  ensureWorkers();
  pump();
}

function pump() {
  ensureWorkers();
  while (idle.length && queue.length) {
    const worker = idle.pop();
    const job = queue.shift();
    job.worker = worker;
    inflight.set(job.seq, job);
    worker.postMessage(job.message);
  }
}

function request(type, payload) {
  if (!WORKERS_USABLE) return mainThread(type, payload);
  ensureWorkers();
  return new Promise((resolve, reject) => {
    const id = ++seq;
    queue.push({
      seq: id,
      message: { seq: id, type, ...payload },
      resolve,
      reject,
      worker: null,
    });
    pump();
  });
}

export function preparePhoto(file, maxDim = 96) {
  return request('prepare', { file, maxDim });
}

export function decodeTextureBlob(file, maxDim = 512) {
  return request('texture', { file, maxDim });
}
