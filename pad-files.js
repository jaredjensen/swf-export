const BASE_PATH = 'img';

const { readdirSync, rename, statSync } = require('fs');
const { extname, basename, join } = require('path');

const getDirs = (p) => readdirSync(p).filter((f) => statSync(join(p, f)).isDirectory());

getDirs(BASE_PATH).forEach((d) => {
  const path = join(BASE_PATH, d);
  const files = readdirSync(path);
  const len = files.length.toString().length;
  files.forEach((f) => {
    const ext = extname(f);
    let bn = basename(f, ext);
    if (bn.length < len) {
      while (bn.length < len) {
        bn = '0' + bn;
      }
      const src = join(path, f);
      const dst = join(path, bn + ext);
      rename(src, dst, (err) => {
        if (err) {
          console.log(`rename failed: ${src} to ${dst}`);
        } else {
          console.log(`renamed ${src} to ${dst}`);
        }
      });
    }
  });
});
