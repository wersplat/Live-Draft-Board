import fs from 'fs/promises';
import path from 'path';

const logosDir = path.resolve('./logos');

function slugify(filename) {
  return filename
    .toLowerCase()
    .replace(/\.[^.]+$/, '')                  // remove extension
    .replace(/\s+/g, '-')                     // spaces → dashes
    .replace(/[^a-z0-9\-]/g, '');             // remove special chars
}

async function renameLogos() {
  const files = await fs.readdir(logosDir);
  for (const original of files) {
    const ext = path.extname(original).toLowerCase();
    const validExt = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!validExt.includes(ext)) continue;

    const slug = slugify(original);
    const newFilename = slug + '.png';
    const oldPath = path.join(logosDir, original);
    const newPath = path.join(logosDir, newFilename);

    if (original === newFilename || (await exists(newPath))) {
      console.log(`⚠️ Skipped: ${original}`);
      continue;
    }

    await fs.rename(oldPath, newPath);
    console.log(`✅ Renamed: ${original} → ${newFilename}`);
  }
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

renameLogos().catch(console.error);