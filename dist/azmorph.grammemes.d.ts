import { Settings } from "./azmorph.types";
export declare const predictionSuffixes: string[];
export declare const prefixes: string[];
export declare let suffixes: any;
export declare function setSuffixes(v: any): void;
export declare let paradigms: any;
export declare function setParadigms(v: any): void;
export declare function getParadigm(): any;
export declare let defaults: Settings;
export declare function setDefaultsConfig(config: Settings): void;
export declare const __init: any[];
export interface Grammeme {
    parent?: string;
    short?: string;
    description?: string;
}
export type Grammemes = string[] | {
    [key: string]: Grammeme;
};
export declare const grammemes: Grammemes;
