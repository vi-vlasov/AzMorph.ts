import { Grammemes } from "../azmorph.grammemes";
import { Tag } from "../azmorph.tag";
import { Parse } from "./azmorph.parser";

export class CombinedParse extends Parse {
    public readonly left: Parse;
    public readonly right: Parse;
    public readonly formCnt?: number;

    constructor(left: Parse, right: Parse) {
        super('', right.tag);
        this.left = left;
        this.right = right;
        this.tag = right.tag;
        this.score = left.score * right.score * 0.8;
        this.stutterCnt = left.stutterCnt + right.stutterCnt;
        this.typosCnt = left.typosCnt + right.typosCnt;
        this.word = `${left.word}-${right.word}`;
        if ('formCnt' in right) {
            this.formCnt = (right as any).formCnt;
        }
    }

    /**
     * Склоняет оба парса так, чтобы результат согласовывался с нужными граммемами
     */
    override inflect(target: Tag | number, grammemes?: Grammemes): CombinedParse | false {
        const inflectedRight = this.right.inflect(target, grammemes);
        if (!inflectedRight) return false;

        let inflectedLeft: Parse | false;
        if (!grammemes && typeof target === 'number') {
            const grammemes: Grammemes = ['POST', 'NMbr', 'CAse', 'PErs', 'TEns'];
            inflectedLeft = this.left.inflect((inflectedRight as Parse).tag, grammemes);
        } else {
            inflectedLeft = this.left.inflect(target, grammemes);
        }

        if (inflectedLeft && inflectedRight) {
            return new CombinedParse(inflectedLeft, inflectedRight as Parse);
        }

        return false;
    }

    override toString(): string {
        return `${this.left.toString()}-${this.right.toString()}`;
    }
}