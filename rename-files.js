const BASE_PATH = 'img';

const { readdirSync, renameSync, statSync } = require('fs');
const { extname, basename, join } = require('path');

const getDirs = (p) => readdirSync(p).filter((f) => statSync(join(p, f)).isDirectory());

getDirs(BASE_PATH).forEach((d) => {
  const folder = join(BASE_PATH, d);
  padFiles(folder);
  squashFiles(folder);
});

function padFiles(folder) {
  const files = readdirSync(folder);
  const len = files.length.toString().length;
  files.forEach((f) => {
    const ext = extname(f);
    let bn = basename(f, ext);
    if (bn.length < len) {
      while (bn.length < len) {
        bn = '0' + bn;
      }
      const src = join(folder, f);
      const dst = join(folder, bn + ext);
      try {
        renameSync(src, dst);
        console.log(`renamed ${src} to ${dst}`);
      } catch (err) {
        console.log(`rename failed: ${src} to ${dst}`);
      }
    }
  });
}

function squashFiles(folder) {
  const files = readdirSync(folder);
  const len = files.length.toString().length;
  files.forEach((f, i) => {
    const ext = extname(f);
    let bn = (i + 1).toString();
    while (bn.length < len) {
      bn = '0' + bn;
    }
    const src = join(folder, f);
    const dst = join(folder, bn + ext);
    try {
      renameSync(src, dst);
      console.log(`squashed ${src} to ${dst}`);
    } catch (err) {
      console.log(`squash failed: ${src} to ${dst}`);
    }
  });
}
