import { Grammemes } from "../azmorph.grammemes";
import { Tag } from "../azmorph.tag";
import { PareserTypes } from "../azmorph.types";
/**
 * Один из возможных вариантов морфологического разбора.
 *
 * @property {string} word Слово в текущей форме (с исправленными ошибками,
 *  если они были)
 * @property {Tag} tag Тег, описывающий текущую форму слова.
 * @property {number} score Число от 0 до 1, соответствующее «уверенности»
 *  в данном разборе (чем оно выше, тем вероятнее данный вариант).
 * @property {number} stutterCnt Число «заиканий», исправленных в слове.
 * @property {number} typosCnt Число опечаток, исправленных в слове.
 */
export class Parse {
    [index: number]: Parse;
    length?: string;
    public parser?: string; // <-- ДОБАВЛЕНО
    public stutterCnt: number;
    public typosCnt: number;
    public score: number;

    constructor(public word: string, public tag: Tag, score = 0, stutterCnt = 0, typosCnt = 0) {
        this.stutterCnt = stutterCnt
        this.typosCnt = typosCnt
        this.score = score
        this.parser = undefined; // <-- Явно инициализируем
    }

    /**
     * Приводит слово к его начальной форме.
     *
     * @param {boolean} keepPOS Не менять часть речи при нормализации (например,
     *  не делать из причастия инфинитив).
     * @returns {Parse} Разбор, соответствующий начальной форме или False,
     *  если произвести нормализацию не удалось.
     */
    normalize(keepPOS?: boolean): Parse {
        return this.inflect(keepPOS ? { POS: this.tag.POS } : 0) as Parse;
    }

    /**
     * Приводит слово к указанной форме.
     *
     * @param {Tag|Parse} [tag] Тег или другой разбор слова, с которым следует
     *  согласовать данный.
     * @param {Array|Object} grammemes Граммемы, по которым нужно согласовать слово.
     * @returns {Parse|False} Разбор, соответствующий указанной форме или False,
     *  если произвести согласование не удалось.
     * @see Tag.matches
    */

    inflect(target?: Tag | Record<string, any> | number, grammemes?: Grammemes): PareserTypes | false {
        // Здесь должен быть реальный механизм изменения формы
        // Пока оставляю заглушкой как в твоём оригинале
        return this;
    }

    /**
     * Приводит слово к форме, согласующейся с указанным числом.
     * Вместо конкретного числа можно указать категорию (согласно http://www.unicode.org/cldr/charts/29/supplemental/language_plural_rules.html).
     *
     * @param {number|string} number Число, с которым нужно согласовать данное слово или категория, описывающая правило построения множественного числа.
     * @returns {Parse|False} Разбор, соответствующий указанному числу или False,
     *  если произвести согласование не удалось.
   */

    pluralize(value: number | 'one' | 'few' | 'many'): PareserTypes | false {
        if (!(this.tag.NOUN || this.tag.ADJF || this.tag.PRTF)) {
            return this;
        }

        let category: 'one' | 'few' | 'many';

        if (typeof value === 'number') {
            const n = value % 100;
            if (n % 10 === 1 && n !== 11) {
                category = 'one';
            } else if (n % 10 >= 2 && n % 10 <= 4 && (n < 10 || n >= 20)) {
                category = 'few';
            } else {
                category = 'many';
            }
        } else {
            category = value;
        }

        if (this.tag.NOUN && !this.tag.nomn && !this.tag.accs) {
            return this.inflect([
                category === 'one' ? 'sing' : 'plur',
                this.tag['CAse']
            ]);
        } else if (category === 'one') {
            return this.inflect(['sing', this.tag.nomn ? 'nomn' : 'accs']);
        } else if (this.tag.NOUN && category === 'few') {
            return this.inflect(['sing', 'gent']);
        } else if ((this.tag.ADJF || this.tag.PRTF) && this.tag.femn && category === 'few') {
            return this.inflect(['plur', 'nomn']);
        } else {
            return this.inflect(['plur', 'gent']);
        }
    }

    /**
   * Проверяет, согласуется ли текущая форма слова с указанной.
   *
   * @param {Tag|Parse} [tag] Тег или другой разбор слова, с которым следует
   *  проверить согласованность.
   * @param {Array|Object} grammemes Граммемы, по которым нужно проверить
   *  согласованность.
   * @returns {boolean} Является ли текущая форма слова согласованной с указанной.
   * @see Tag.matches
   */

    matches(tag: Tag | Parse, grammemes?: string[] | Record<string, any>): boolean {
        return this.tag.matches(tag, grammemes);
    }

    /**
     * Возвращает текущую форму слова.
     *
     * @returns {String} Текущая форма слова.
     */

    toString(): string {
        return this.word;
    }

    // Выводит информацию о слове в консоль.

    log(): void {
        console.group(`Parse: ${this.word}`);
        console.log('Stutters:', this.stutterCnt, 'Typos:', this.typosCnt);
        console.log('Tag:', this.tag.ext?.toString() ?? this.tag.toString());
        console.groupEnd();
    }

}