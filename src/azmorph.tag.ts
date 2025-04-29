import { grammemes } from "./azmorph.grammemes";
import { deepFreeze } from "./azmorph.tools";
import { Parse } from "./parsers/azmorph.parser";

export class Tag {
    stat: string[];
    flex: string[];
    ext?: Tag;
    POS?: string;

    [key: string]: any; // Динамические граммемы типа this['NOUN'] = true

    constructor(public str: string) {
        const [statStr, flexStr = ''] = str.split(' ');
        this.stat = statStr ? statStr.split(',') : [];
        this.flex = flexStr ? flexStr.split(',') : [];

        this.processGrammemes(this.stat);
        this.processGrammemes(this.flex);

        if (this.POST) {
            this.POS = this.POST;
        }
    }

    private processGrammemes(grams: string[]): void {
        for (const gram of grams) {
            this[gram] = true;

            if (typeof grammemes !== 'object' || Array.isArray(grammemes)) {
                continue; // Нет смысла искать parent в массиве
            }

            let parent = grammemes[gram]?.parent;
            while (parent) {
                this[parent] = gram;
                parent = grammemes[parent]?.parent;
            }
        }
    }

    toString(): string {
        return [...this.stat, this.flex.length ? ' ' + this.flex.join(',') : ''].join('').trim();
    }

    matches(target: Tag | Parse | string[] | Record<string, any>, grammemesList?: string[] | Record<string, any>): boolean {
        if (!grammemesList) {
            if (Array.isArray(target)) {
                return target.every((gram) => !!this[gram]);
            }

            for (const [key, value] of Object.entries(target)) {
                if (Array.isArray(value)) {
                    if (!value.includes(this[key])) return false;
                } else if (this[key] !== value) {
                    return false;
                }
            }
            return true;
        }
        const tagObj = target instanceof Parse ? target.tag : target;

        if (typeof tagObj !== 'object' || tagObj === null || Array.isArray(tagObj)) {
            return false; // Недопустимый формат
        }

        return (grammemesList as string[]).every((gram) => tagObj[gram] === this[gram]);
    }

    isProductive(): boolean {
        return !(
            this.NUMR || this.NPRO || this.PRED || this.PREP ||
            this.CONJ || this.PRCL || this.INTJ || this.Apro ||
            this.NUMB || this.ROMN || this.LATN || this.PNCT || this.UNKN
        );
    }

    isCapitalized(): boolean {
        return !!(this.Name || this.Surn || this.Patr || this.Geox || this.Init);
    }
}

export function makeTag(tagInt: any, tagExt: any) {
    let tag = new Tag(tagInt);
    tag.ext = new Tag(tagExt);
    return deepFreeze(tag) as Tag;
}
