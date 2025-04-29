declare let Dawg: any;
declare class DAWG {
    private units;
    private guide;
    private format;
    constructor(units: Uint32Array, guide: Uint8Array, format: string);
    followByte(index: number, c: number): number;
    followString(str: string, index?: number): number;
    hasValue(index: number): boolean;
    value(index: number): number;
    find(str: string): number;
    iterateAll(index: number): number[];
    findAll(str: string, replaces: any, mstutter: number, mtypos: number): any;
}
export { Dawg, DAWG };
