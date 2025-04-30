import { autoTypos } from "./azmorph.constants";
export function getDictionaryScore(stutterCnt, typosCnt) {
    return Math.pow(0.3, typosCnt) * Math.pow(0.6, Math.min(stutterCnt, 1));
}
export function deepFreeze(obj) {
    if (!Object.freeze) {
        return obj;
    }
    Object.getOwnPropertyNames(obj).forEach(name => {
        const value = obj[name];
        if (typeof value === 'object' && value !== null) {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}
export function lookup(dawg, word, config) {
    let entries;
    if (config.typos == 'auto') {
        entries = dawg.findAll(word, config.replacements, config.stutter, 0);
        for (let i = 0; i < autoTypos.length && !entries.length && word.length > autoTypos[i]; i++) {
            entries = dawg.findAll(word, config.replacements, config.stutter, i + 1);
        }
    }
    else {
        entries = dawg.findAll(word, config.replacements, config.stutter, config.typos);
    }
    return entries;
}
