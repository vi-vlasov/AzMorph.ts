import { promises as fs } from 'fs';
export const AzMorphLoader = {
    async load(url, responseType) {
        const data = await fs.readFile(url, { encoding: responseType === 'json' ? 'utf8' : null });
        if (responseType === 'json') {
            try {
                return JSON.parse(data);
            }
            catch (err) {
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
