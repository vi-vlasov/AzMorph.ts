
import { prefixes } from "../azmorph.constants";
import { paradigms, suffixes } from "../azmorph.grammemes";
import { Tag } from "../azmorph.tag";
import { getDictionaryScore } from "../azmorph.tools";
import { Parse } from "./azmorph.parser";


export class DictionaryParse extends Parse {
    private _base?: string;
    private readonly paradigm: number[];
    private readonly formCnt: number;
    public readonly tag: Tag;
    public score: number = 0;
    public prefix: string;
    public readonly suffix: string;
    public readonly tags: any = [];

    constructor(
        public readonly word: string,
        public readonly paradigmIdx: number,
        public readonly formIdx: number,
        stutterCnt = 0,
        typosCnt = 0,
        prefix = '',
        suffix = '',
        tags: any = []
    ) {
        super(word, tags[paradigms[paradigmIdx][paradigms[paradigmIdx].length / 3 + formIdx]]);
        this.paradigm = paradigms[paradigmIdx];
        this.formCnt = this.paradigm.length / 3;
        this.tag = tags[this.paradigm[this.formCnt + formIdx]];
        this.stutterCnt = stutterCnt;
        this.typosCnt = typosCnt;
        this.score = getDictionaryScore(this.stutterCnt, this.typosCnt);
        this.prefix = prefix;
        this.suffix = suffix;
        this.tags = tags;
    }

    /** Возвращает основу слова */
    base(): string {
        if (!this._base) {
            const prefixLength = prefixes[this.paradigm[(this.formCnt << 1) + this.formIdx]].length;
            const suffixLength = suffixes[this.paradigm[this.formIdx]].length;
            this._base = this.word.substring(prefixLength, this.word.length - suffixLength);
        }
        return this._base;
    }

    /**
     * Склоняет/спрягает слово согласно граммемам.
     * @param target - целевой тег или номер формы
     * @param grammemes - дополнительные граммемы для проверки
     */
    override inflect(target: Tag | number, grammemes?: any): DictionaryParse | false {
        if (typeof target === 'number') {
            if (target < 0 || target >= this.formCnt) return false;
            return new DictionaryParse(
                prefixes[this.paradigm[(this.formCnt << 1) + target]] +
                this.base() +
                suffixes[this.paradigm[target]],
                this.paradigmIdx,
                target,
                0,
                0,
                this.prefix,
                this.suffix,
                this.tags
            );
        }

        for (let formIdx = 0; formIdx < this.formCnt; formIdx++) {
            const formTag = this.tags[this.paradigm[this.formCnt + formIdx]];
            if (formTag.matches(target, grammemes)) {
                return new DictionaryParse(
                    prefixes[this.paradigm[(this.formCnt << 1) + formIdx]] +
                    this.base() +
                    suffixes[this.paradigm[formIdx]],
                    this.paradigmIdx,
                    formIdx,
                    0,
                    0,
                    this.prefix,
                    this.suffix,
                    this.tags
                );
            }
        }

        return false;
    }

    /** Логирование информации о разборе */
    override log(): void {
        console.group(`Word: ${this.toString()}`);
        console.log('Stutter:', this.stutterCnt, 'Typos:', this.typosCnt);
        console.log('Base form:', `${prefixes[this.paradigm[(this.formCnt << 1) + this.formIdx]]}|${this.base()}|${suffixes[this.paradigm[this.formIdx]]}`);
        console.log('Tag:', this.tag.ext?.toString() ?? this.tag.toString());

        const normalized = this.normalize();
        if (normalized) {
            console.log('Normalized =>', normalized.toString(), `(${normalized.tag.ext?.toString() ?? normalized.tag.toString()})`);
        }

        const normalizedKeepPOS = this.normalize(true);
        if (normalizedKeepPOS) {
            console.log('Normalized (keep POS) =>', normalizedKeepPOS.toString(), `(${normalizedKeepPOS.tag.ext?.toString() ?? normalizedKeepPOS.tag.toString()})`);
        }

        console.groupCollapsed(`All forms (${this.formCnt} total)`);
        for (let i = 0; i < this.formCnt; i++) {
            const form = this.inflect(i) as DictionaryParse;
            console.log(form.toString(), `(${form.tag.ext?.toString() ?? form.tag.toString()})`);
        }
        console.groupEnd();
        console.groupEnd();
    }

    /** Строковое представление разбора */
    override toString(): string {
        if (this.prefix) {
            const formPrefix = prefixes[this.paradigm[(this.formCnt << 1) + this.formIdx]];
            return formPrefix + this.prefix + this.word.substring(formPrefix.length) + this.suffix;
        }
        return this.word + this.suffix;
    }
}
