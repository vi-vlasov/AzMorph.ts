export declare class Token {
    source: any;
    st: number;
    length: number;
    index: number;
    firstUpper: boolean;
    allUpper: boolean;
    type: string;
    subType?: string | undefined;
    quote?: string;
    _str: string;
    /**
   * Токен, соответствующий некоторой подстроке в представленном на вход тексте.
   *
   * @constructor
   * @property {string} type Тип токена.
   * @property {string} subType Подтип токена.
   * @property {number} st Индекс первого символа, входящего в токен.
   * @property {number} en Индекс последнего символа, входящего в токен.
   * @property {number} length Длина токена.
   * @property {boolean} firstUpper True, если первый символ токена является заглавной буквой.
   * @property {boolean} allUpper True, если все символы в токене являются заглавными буквами.
   */
    constructor(source: any, st: number, length: number, index: number, firstUpper: boolean, allUpper: boolean, type: string, subType?: string | undefined);
    toString(): string;
    indexOf(str: string): number;
    toLowerCase(): string;
    isCapitalized(): boolean;
    en(): number;
}
