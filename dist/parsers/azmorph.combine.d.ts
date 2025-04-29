import { Grammemes } from "../azmorph.grammemes";
import { Tag } from "../azmorph.tag";
import { Parse } from "./azmorph.parser";
export declare class CombinedParse extends Parse {
    readonly left: Parse;
    readonly right: Parse;
    readonly formCnt?: number;
    constructor(left: Parse, right: Parse);
    /**
     * Склоняет оба парса так, чтобы результат согласовывался с нужными граммемами
     */
    inflect(target: Tag | number, grammemes?: Grammemes): CombinedParse | false;
    toString(): string;
}
