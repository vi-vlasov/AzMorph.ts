import { Token } from "./azmorph.token";
import { TokenConfig } from "./azmorph.types";
declare class Tokens {
    private text;
    private config?;
    static WORD: string;
    static NUMBER: string;
    static OTHER: string;
    static DIGIT: string;
    static CYRIL: string;
    static LATIN: string;
    static MIXED: string;
    static PUNCT: string;
    static SPACE: string;
    static MARKUP: string;
    static NEWLINE: string;
    static EMAIL: string;
    static LINK: string;
    static HASHTAG: string;
    static MENTION: string;
    static TAG: string;
    static CONTENT: string;
    static SCRIPT: string;
    static STYLE: string;
    static COMMENT: string;
    static CLOSING: string;
    static TEMPLATE: string;
    static RANGE: string;
    static ENTITY: string;
    tokens: Token[] | undefined;
    index: number | undefined;
    source: string | undefined;
    constructor(text: string, config?: TokenConfig | undefined);
    /**
   * Отправляет ещё один кусок текста на токенизацию. Таким образом вполне
   * допустимо обрабатывать большие документы частями, многократно вызывая этот
   * метод. При этом токен может начаться в одной части и продолжиться в
   * следующей (а закончиться в ещё одной).
   *
   * @param {string} text Строка для разбивки на токены.
   * @param {Object} [config] Опции, применяемые при разбивке. Перекрывают
   *  опции, заданные в конструкторе токенизатора.
   * @see Tokens
   */
    append(text: string, config?: TokenConfig): this | undefined;
    /**
   * Завершает токенизацию, возвращая список токенов.
   *
   * Эта и другие функции принимают последними параметрами filter и флаг exclude. Они
   * служат для фильтрации токенов (потому что часто удобнее получать не все токены, а
   * только определенную часть из них).
   *
   * Если в filter передана функция, то параметр exclude игнорируется, а filter вызывается
   * аналогично коллбэку в методе Array.prototype.filter: ей передаются параметры
   * token, index, array (текущий токен, его индекс и общий список токенов). Будут
   * возвращены только токены, для которых функция вернет истинное значение.
   *
   * Если в filter передан массив (или объект с полем length), то возвращаются токены, типы
   * которых либо входят в этот массив (exclude=false), либо не входят в него (exclude=true).
   * Вместо типов можно использовать строки вида 'WORD.LATIN' (тип, символ «точка» и подтип).
   *
   * Если в filter передать объект, то ключами в нём должны быть типы токенов, а значениями -
   * true или false в зависимости от того, включать такие токены в ответ или нет. Как и в случае случае
   * с массивом, в качестве ключей можно использовать строки вида 'WORD.LATIN'.
   * Здесь параметр exclude означает, следует ли ограничить выдачу только теми типами, которые
   * перечислены в filter.
   * Значения с указанием подтипа имеют больший приоритет, чем просто типы. Благодаря этому можно
   * делать такие странные вещи:
   *
   * ```
   * t.done({ 'WORD': false, 'WORD.LATIN': true }, false);
   * ```
   * (то есть вернуть все теги, кроме тегов с типом WORD, но включить теги с подтипом LATIN)
   *
   * @param {Function|String[]|Object} [filter] Типы токенов, по которым нужно
   *  отфильтровать результат (или функция для фильтрации).
   * @param {boolean} [exclude=False] Инвертирует фильтр, т.е. возвращаются
   *  токены со всеми типами, за исключением перечисленных в filter.
   * @returns {Token[]} Список токенов после фильтрации.
   */
    done(filter?: any, exclude?: boolean): Token[];
    /**
   * Возвращает токен по его индексу.
   *
   * @param {Function|String[]|Object} [filter] См. описание метода done.
   * @param {boolean} [exclude=False] См. описание метода done.
   * @returns {Token|False} Токен или false, если индекс вышел за пределы массива токенов.
   */
    get(index: number, filter: any, exclude: boolean): Token | boolean;
    count(filter: any, exclude: boolean): number;
    /**
   * Получает следующий токен относительно текущей позиции.
   *
   * @param {boolean} moveIndex Следует ли переместить указатель к
   *  следующему токену (в противном случае следующий вызов nextToken вернет
   *  тот же результат)
   * @param {Function|String[]|Object} [filter] См. описание метода done.
   * @param {boolean} [exclude=False] См. описание метода done.
   * @returns {Token|null} Следующий токен или null, если подходящих токенов
   *  впереди нет.
   */
    nextToken(moveIndex: boolean, filter: any, exclude: boolean): Token | null;
    /**
   * Проверяет, является ли следующий (за исключением пробелов) токен знаком
   * препинания или нет.
   *
   * @returns {Token|False} False, если следующий токен не является знаком
   *  препинания, либо сам токен в противном случае.
   */
    punctAhead(): Token | boolean;
    /**
     * Получает предыдущий токен относительно текущей позиции.
     *
     * @param {boolean} moveIndex Следует ли переместить указатель к
     *  предыдущему токену (в противном случае следующий вызов prevToken вернет
     *  тот же результат)
     * @param {Function|String[]|Object} [filter] См. описание метода done.
     * @param {boolean} [exclude=False] См. описание метода done.
     * @returns {Token|null} Предыдущий токен или null, если подходящих токенов
     *  позади нет.
     */
    prevToken(moveIndex: boolean, filter: any, exclude: boolean): Token | null;
    /**
   * Проверяет, является ли предыдущий (за исключением пробелов) токен знаком
   * препинания или нет.
   *
   * @returns {Token|False} False, если предыдущий токен не является знаком
   *  препинания, либо сам токен в противном случае.
   */
    punctBehind(): Token | boolean;
    /**
   * Проверяет, есть ли впереди текущей позиции токены, удовлетворяющие фильтру.
   *
   * @param {Function|String[]|Object} [filter] См. описание метода done.
   * @param {boolean} [exclude=False] См. описание метода done.
   * @returns {boolean} True если впереди есть хотя бы один подходящий токен,
   *  и False в противном случае.
   */
    hasTokensAhead(filter: any, exclude: boolean): boolean;
    /**
   * Проверяет, есть ли позади текущей позиции токены, удовлетворяющие фильтру.
   *
   * @param {Function|String[]|Object} [filter] См. описание метода done.
   * @param {boolean} [exclude=False] См. описание метода done.
   * @returns {boolean} True если позади есть хотя бы один подходящий токен,
   *  и False в противном случае.
   */
    hasTokensBehind(filter: any, exclude: boolean): boolean;
}
export { Tokens };
