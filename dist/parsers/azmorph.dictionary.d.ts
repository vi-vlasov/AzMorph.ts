import { Tag } from "../azmorph.tag";
import { Parse } from "./azmorph.parser";
export declare class DictionaryParse extends Parse {
    readonly word: string;
    readonly paradigmIdx: number;
    readonly formIdx: number;
    private _base?;
    private readonly paradigm;
    private readonly formCnt;
    readonly tag: Tag;
    score: number;
    prefix: string;
    readonly suffix: string;
    readonly tags: any;
    constructor(word: string, paradigmIdx: number, formIdx: number, stutterCnt?: number, typosCnt?: number, prefix?: string, suffix?: string, tags?: any);
    /** Возвращает основу слова */
    base(): string;
    /**
     * Склоняет/спрягает слово согласно граммемам.
     * @param target - целевой тег или номер формы
     * @param grammemes - дополнительные граммемы для проверки
     */
    inflect(target: Tag | number, grammemes?: any): DictionaryParse | false;
    /** Логирование информации о разборе */
    log(): void;
    /** Строковое представление разбора */
    toString(): string;
}
