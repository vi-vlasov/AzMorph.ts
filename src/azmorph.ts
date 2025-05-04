import { promises as fs } from 'fs';
import path from 'path';
import { AzMorph } from './azmorph.types';



export const AzMorphLoader: AzMorph = {
  async load(url: string, responseType: 'json' | 'arraybuffer') {
    let data: Buffer | string;

    try {
      // Путь до установленного пакета (укажет на dist/azmorph.js)
      const packageEntry = require.resolve('azmorph');
      const packageRoot = path.dirname(path.dirname(packageEntry)); // поднимаемся из dist

      const dictsPath = path.join(packageRoot, 'dicts', path.basename(url));
      console.log('dictsPath', dictsPath);
      data = await fs.readFile(dictsPath, { encoding: responseType === 'json' ? 'utf8' : null });
    } catch (err) {
      // fallback на локальный путь
      data = await fs.readFile(url, { encoding: responseType === 'json' ? 'utf8' : null });
    }

    if (responseType === 'json') {
      try {
        return JSON.parse(data as string);
      } catch {
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
