import { resolve } from 'path';

import { addAlias } from 'module-alias';

export function setupModuleAlias() {
  let rootPath = 'src';

  if (process.cwd().includes('database')) rootPath = `../${rootPath}`;
  else if (!process.env.TS_NODE_DEV) rootPath = `dist/${rootPath}`;

  addAlias('@', resolve(rootPath));
}
