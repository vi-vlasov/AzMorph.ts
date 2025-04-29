interface AzMorph {
    load: (url: string, responseType: 'json' | 'arraybuffer') => Promise<Buffer | ArrayBuffer | object>;
    extend: <T extends object, U extends object>(target: T, source: U) => T & U;
}
export declare const AzMorphLoader: AzMorph;
export {};
