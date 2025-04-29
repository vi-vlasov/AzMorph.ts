import { DAWG } from "./azmorph.dawg";
export declare function getDictionaryScore(stutterCnt: number, typosCnt: number): number;
export declare function deepFreeze<T>(obj: T): Readonly<T>;
export declare function lookup(dawg: DAWG, word: any, config: any): any;
