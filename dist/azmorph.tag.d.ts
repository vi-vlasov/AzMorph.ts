import { Parse } from "./parsers/azmorph.parser";
export declare class Tag {
    str: string;
    stat: string[];
    flex: string[];
    ext?: Tag;
    POS?: string;
    [key: string]: any;
    constructor(str: string);
    private processGrammemes;
    toString(): string;
    matches(target: Tag | Parse | string[] | Record<string, any>, grammemesList?: string[] | Record<string, any>): boolean;
    isProductive(): boolean;
    isCapitalized(): boolean;
}
export declare function makeTag(tagInt: any, tagExt: any): Tag;
