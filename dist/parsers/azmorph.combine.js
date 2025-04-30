import { Parse } from "./azmorph.parser";
export class CombinedParse extends Parse {
    constructor(left, right) {
        super('', right.tag);
        this.left = left;
        this.right = right;
        this.tag = right.tag;
        this.score = left.score * right.score * 0.8;
        this.stutterCnt = left.stutterCnt + right.stutterCnt;
        this.typosCnt = left.typosCnt + right.typosCnt;
        this.word = `${left.word}-${right.word}`;
        if ('formCnt' in right) {
            this.formCnt = right.formCnt;
        }
    }
    /**
     * Склоняет оба парса так, чтобы результат согласовывался с нужными граммемами
     */
    inflect(target, grammemes) {
        const inflectedRight = this.right.inflect(target, grammemes);
        if (!inflectedRight)
            return false;
        let inflectedLeft;
        if (!grammemes && typeof target === 'number') {
            const grammemes = ['POST', 'NMbr', 'CAse', 'PErs', 'TEns'];
            inflectedLeft = this.left.inflect(inflectedRight.tag, grammemes);
        }
        else {
            inflectedLeft = this.left.inflect(target, grammemes);
        }
        if (inflectedLeft && inflectedRight) {
            return new CombinedParse(inflectedLeft, inflectedRight);
        }
        return false;
    }
    toString() {
        return `${this.left.toString()}-${this.right.toString()}`;
    }
}
