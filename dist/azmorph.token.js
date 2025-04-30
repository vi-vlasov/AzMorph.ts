export class Token {
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
    constructor(source, st, length, index, firstUpper, allUpper, type, subType) {
        this.source = source;
        this.st = st;
        this.length = length;
        this.index = index;
        this.firstUpper = firstUpper;
        this.allUpper = allUpper;
        this.type = type;
        this.subType = subType;
        this.quote = '';
        this._str = '';
        if (subType) {
            this.subType = subType;
        }
    }
    toString() {
        return (('_str' in this) && (this._str.length == this.length)) ? this._str : (this._str = this.source.substr(this.st, this.length));
    }
    indexOf(str) {
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
    toLowerCase() {
        return this.toString().toLocaleLowerCase();
    }
    isCapitalized() {
        return this.firstUpper && !this.allUpper;
    }
    en() {
        return this.st + this.length - 1;
    }
}
