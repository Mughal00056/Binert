import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

/**
 * Prevents `Plugin: builtin:vite-resolve` Pre-transform error:
 * `JSONError { path: "/data/data/com.termux/files/home/package.json", message: "File is empty" }`
 * when running inside Termux or nested home directories where a parent package.json is 0 bytes.
 */
function sanitizeEmptyPackageJsonFiles(): void {
  const candidatePaths = new Set<string>([
    '/data/data/com.termux/files/home/package.json',
    path.resolve(os.homedir(), 'package.json'),
  ]);

  let currentDir = path.resolve(__dirname);
  for (let i = 0; i < 6; i++) {
    candidatePaths.add(path.join(currentDir, 'package.json'));
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  for (const pkgPath of candidatePaths) {
    try {
      if (fs.existsSync(pkgPath)) {
        const stat = fs.statSync(pkgPath);
        if (stat.isFile()) {
          const raw = fs.readFileSync(pkgPath, 'utf-8');
          if (raw.trim().length === 0) {
            fs.writeFileSync(pkgPath, '{\n  "private": true\n}\n', 'utf-8');
          }
        }
      }
    } catch {
      // Ignore permission errors outside user-writable paths
    }
  }
}

function termuxPackageJsonGuardPlugin(): Plugin {
  return {
    name: 'apexstore-termux-package-json-guard',
    enforce: 'pre',
    configResolved() {
      sanitizeEmptyPackageJsonFiles();
    },
    buildStart() {
      sanitizeEmptyPackageJsonFiles();
    },
  };
}

sanitizeEmptyPackageJsonFiles();

export default defineConfig(() => {
  const projectRoot = path.resolve(__dirname);

  return {
    root: projectRoot,
    envDir: projectRoot,
    cacheDir: path.resolve(projectRoot, 'node_modules/.vite'),
    plugins: [termuxPackageJsonGuardPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    server: {
      fs: {
        strict: true,
        allow: [projectRoot],
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
