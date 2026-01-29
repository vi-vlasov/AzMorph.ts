import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Определяем путь к текущему модулю
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const AzMorphLoader = {
    async load(url, responseType) {
        let data;
        // Определяем корень пакета (поднимаемся из dist к корню)
        const packageRoot = path.dirname(__dirname);
        // Если url уже абсолютный путь, используем его
        if (path.isAbsolute(url)) {
            data = await fs.readFile(url, { encoding: responseType === 'json' ? 'utf8' : null });
        }
        else {
            // Пробуем найти файл относительно корня пакета
            // url может быть вида 'dicts/words.dawg' или просто 'words.dawg'
            let dictsPath;
            if (url.startsWith('dicts/') || url.includes('/')) {
                // Если путь содержит 'dicts/' или другие директории, используем как есть
                dictsPath = path.join(packageRoot, url);
            }
            else {
                // Если только имя файла, ищем в dicts
                dictsPath = path.join(packageRoot, 'dicts', url);
            }
            try {
                data = await fs.readFile(dictsPath, { encoding: responseType === 'json' ? 'utf8' : null });
            }
            catch (err) {
                // Fallback: пробуем относительный путь от текущего файла
                const relativePath = path.join(__dirname, '..', url);
                data = await fs.readFile(relativePath, { encoding: responseType === 'json' ? 'utf8' : null });
            }
        }
        if (responseType === 'json') {
            try {
                return JSON.parse(data);
            }
            catch {
                throw new Error('Invalid JSON format');
            }
        }
        if (responseType === 'arraybuffer') {
            const buffer = data;
            return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        }
        throw new Error(`Unknown responseType: ${responseType}`);
    },
    extend(target, source) {
        return { ...target, ...source };
    }
};
