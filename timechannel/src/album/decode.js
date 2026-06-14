/* ============================================================
   照片解码（worker 与主线程兜底共用，勿在两边各留一份拷贝）
   - readDateMs：EXIF 拍摄时间，取不到退回文件修改时间
   - makeThumbBlob：缩图 JPEG；降采样交给 createImageBitmap 内部完成，
     避免对全尺寸位图 drawImage（主线程兜底时这是卡顿大头）
============================================================ */
import exifr from 'exifr';

const DATE_KEYS = ['DateTimeOriginal', 'CreateDate', 'ModifyDate'];

export async function readDateMs(file) {
  try {
    const meta = await exifr.parse(file, DATE_KEYS);
    const date = meta?.DateTimeOriginal || meta?.CreateDate || meta?.ModifyDate;
    if (date) return new Date(date).getTime();
  } catch (_) {}
  return file.lastModified || Date.now();
}

export async function makeThumbBlob(file, maxDim, quality) {
  let bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width || 1, bitmap.height || 1));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  if (scale < 1) {
    const small = await createImageBitmap(bitmap, {
      resizeWidth: width, resizeHeight: height, resizeQuality: 'high',
    });
    bitmap.close();
    bitmap = small;
  }
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/jpeg', quality });
}
