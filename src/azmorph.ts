import { promises as fs } from 'fs';
import path from 'path';

interface AzMorph {
  load: (url: string, responseType: 'json' | 'arraybuffer') => Promise<Buffer | ArrayBuffer | object>;
  extend: <T extends object, U extends object>(target: T, source: U) => T & U;
}

export const AzMorphLoader: AzMorph = {
  async load(url, responseType) {
    let data: Buffer | string;
    try {
      // Сначала пробуем загрузить из node_modules
      const packagePath = require.resolve('azmorph');
      const dictsPath = path.join(path.dirname(packagePath), 'dicts', path.basename(url));
      data = await fs.readFile(dictsPath, { encoding: responseType === 'json' ? 'utf8' : null });
    } catch (err) {
      // Если не получилось, пробуем загрузить локально
      data = await fs.readFile(url, { encoding: responseType === 'json' ? 'utf8' : null });
    }

    if (responseType === 'json') {
      try {
        return JSON.parse(data as string);
      } catch (err) {
        throw new Error('Invalid JSON format');
      }
    }

    if (responseType === 'arraybuffer') {
      const buffer = data as Buffer;
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }

    throw new Error(`Unknown responseType: ${responseType}`);
  },

  extend(target, source) {
    return { ...target, ...source };
  }
};
