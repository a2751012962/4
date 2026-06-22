/* file:// 下浏览器禁止创建 Worker（双击 index.html 直接玩的场景），
   退回主线程执行同样的解码逻辑（与 worker 共用 decode.js）。
   注意：这里必须是静态 import——构建产物会被内联成单文件，file:// 下
   动态 import 外部 chunk 同样会被 CORS 拦截；代价是 http 场景主包也
   背上 exifr，属有意取舍。 */
import { readDateMs, makeThumbBlob } from './decode.js';

const WORKERS_USABLE = location.protocol !== 'file:';

async function mainThread(type, { file, maxDim }) {
  if (type === 'prepare') {
    const [dateMs, microBlob] = await Promise.all([
      readDateMs(file),
      makeThumbBlob(file, maxDim || 96, 0.66),
    ]);
    return { ok: true, dateMs, microBlob };
  }
  if (type === 'texture') {
    return { ok: true, blob: await makeThumbBlob(file, maxDim || 512, 0.82) };
  }
  throw new Error(`unknown worker task: ${type}`);
}

const WORKER_COUNT = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));

let seq = 0;
let workerFails = 0;
let workersDead = false; // worker 反复加载失败（404/MIME）后永久退回主线程，避免无限重生
const workers = [];
const idle = [];
const queue = [];
const inflight = new Map();

function ensureWorkers() {
  if (workersDead || workers.length || !WORKERS_USABLE) return;
  for (let i = 0; i < WORKER_COUNT; i++) {
    const worker = new Worker(new URL('../workers/import.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => finish(worker, event.data);
    worker.onerror = (event) => failWorker(worker, event.message || 'worker error');
    workers.push(worker);
    idle.push(worker);
  }
}

// worker 全部判废：把排队作业平滑排空到主线程解码
function drainToMain() {
  while (queue.length) {
    const job = queue.shift();
    mainThread(job.message.type, job.message).then(job.resolve, job.reject);
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
  // 把该 worker 的在飞作业改回队列重试（而非直接 reject），失败次数累计
  for (const [id, job] of inflight) {
    if (job.worker === worker) {
      inflight.delete(id);
      job.worker = null;
      queue.push(job);
    }
  }
  const idx = workers.indexOf(worker);
  if (idx >= 0) workers.splice(idx, 1);
  const idleIdx = idle.indexOf(worker);
  if (idleIdx >= 0) idle.splice(idleIdx, 1);
  try { worker.terminate(); } catch (_) {}
  if (++workerFails >= WORKER_COUNT * 2) { // 持久故障：永久退回主线程
    workersDead = true;
    console.warn('import workers unavailable, falling back to main thread:', message);
    drainToMain();
    return;
  }
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
  if (!WORKERS_USABLE || workersDead) return mainThread(type, payload);
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
