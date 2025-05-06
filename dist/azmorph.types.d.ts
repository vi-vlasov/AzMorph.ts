import { CombinedParse } from "./parsers/azmorph.combine";
import { DictionaryParse } from "./parsers/azmorph.dictionary";
import { Parse } from "./parsers/azmorph.parser";
export interface AzMorph {
    load: (url: string, responseType: 'json' | 'arraybuffer') => Promise<Buffer | ArrayBuffer | object>;
    extend: <T extends object, U extends object>(target: T, source: U) => T & U;
}
export interface DawgInstance {
    units: Uint32Array;
    guide: Uint8Array;
    format: string;
}
export interface DawgStatic {
    fromArrayBuffer(data: ArrayBufferLike, format: string): DawgInstance;
    load(url: string, format: string): Promise<DawgInstance>;
}
export type Settings = {
    ignoreCase: boolean;
    replacements: Record<string, string>;
    stutter: number;
    typos: number;
    parsers: string[];
    forceParse: boolean;
    normalizeScore: boolean;
};
export type MorphParserResult = Parse[];
export interface TagProps {
    stat: string[];
    flex: string[];
}
export interface TokenConfig {
    html: boolean;
    wiki: boolean;
    markdown: boolean;
    hashtags: boolean;
    mentions: boolean;
    emails: boolean;
    links: {
        protocols: boolean;
        www: boolean;
        tlds: Record<string, boolean>;
    };
}
export type PareserTypes = DictionaryParse | Parse | CombinedParse;
