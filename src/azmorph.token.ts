
export class Token {
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
  constructor(public source: any, public st: number, public length: number, public index: number, public firstUpper: boolean, public allUpper: boolean, public type: string, public subType?: string) {
    this.quote = '';
    this._str = '';
    if (subType) {
      this.subType = subType;
    }
  }

  toString(): string {
    return (('_str' in this) && (this._str.length == this.length)) ? this._str : (this._str = this.source.substr(this.st, this.length));
  }

  indexOf(str: string): number {
    if (str.length == 1) {
      for (let i = 0; i < this.length; i++) {
        if (this.source[this.st + i] == str) {
          return i;
        }
      }
      return -1;
    }
    return this.toString().indexOf(str);
  }

  toLowerCase(): string {
    return this.toString().toLocaleLowerCase();
  }

  isCapitalized(): boolean {
    return this.firstUpper && !this.allUpper;
  }

  en(): number {
    return this.st + this.length - 1;
  }
}