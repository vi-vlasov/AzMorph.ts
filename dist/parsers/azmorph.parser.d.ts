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
export declare class Parse {
    word: string;
    tag: Tag;
    [index: number]: Parse;
    length?: string;
    parser?: string;
    stutterCnt: number;
    typosCnt: number;
    score: number;
    constructor(word: string, tag: Tag, score?: number, stutterCnt?: number, typosCnt?: number);
    /**
     * Приводит слово к его начальной форме.
     *
     * @param {boolean} keepPOS Не менять часть речи при нормализации (например,
     *  не делать из причастия инфинитив).
     * @returns {Parse} Разбор, соответствующий начальной форме или False,
     *  если произвести нормализацию не удалось.
     */
    normalize(keepPOS?: boolean): Parse;
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
    inflect(target?: Tag | Record<string, any> | number, grammemes?: Grammemes): PareserTypes | false;
    /**
     * Приводит слово к форме, согласующейся с указанным числом.
     * Вместо конкретного числа можно указать категорию (согласно http://www.unicode.org/cldr/charts/29/supplemental/language_plural_rules.html).
     *
     * @param {number|string} number Число, с которым нужно согласовать данное слово или категория, описывающая правило построения множественного числа.
     * @returns {Parse|False} Разбор, соответствующий указанному числу или False,
     *  если произвести согласование не удалось.
   */
    pluralize(value: number | 'one' | 'few' | 'many'): PareserTypes | false;
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
    matches(tag: Tag | Parse, grammemes?: string[] | Record<string, any>): boolean;
    /**
     * Возвращает текущую форму слова.
     *
     * @returns {String} Текущая форма слова.
     */
    toString(): string;
    log(): void;
}
