try {
  require('./node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node');
  console.log('loaded');
} catch (e) {
  console.error('ERR', e && e.message ? e.message : e);
  process.exit(1);
}
