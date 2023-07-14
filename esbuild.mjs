import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/wrapper.ts'],
    bundle: true,
    minify: true,
    outfile: 'esdist/labkey-api-js-core.min.js',
    platform: 'browser',
    sourcemap: true,
});

await esbuild.build({
    entryPoints: ['src/wrapper-dom.ts'],
    bundle: true,
    minify: true,
    outfile: 'esdist/labkey-api-js-dom.min.js',
    platform: 'browser',
    sourcemap: true,
});

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    outfile: 'esdist/index.js',
    platform: 'browser',
    sourcemap: true,
    target: 'ES6',
});
