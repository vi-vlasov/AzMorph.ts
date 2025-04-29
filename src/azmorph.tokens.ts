import { AzMorphLoader } from "./azmorph";
import { HTML_ENTITIES, TLDs } from "./azmorph.constants";
import { Token } from "./azmorph.token";
import { TokenConfig } from "./azmorph.types";

/** @namespace azmorph **/


const defaults_tokens: TokenConfig = {
  html: false,
  wiki: false,       // TODO: check all cases
  markdown: false,   // TODO: check all cases
  hashtags: true,
  mentions: true,
  emails: true,
  links: {
    protocols: true,
    www: false,
    tlds: {}
  }
};

for (let i = 0; i < TLDs.length; i++) {
  defaults_tokens.links.tlds[TLDs[i]] = true;
}


class Tokens {
  static WORD = 'WORD';
  static NUMBER = 'NUMBER';
  static OTHER = 'OTHER';
  static DIGIT = 'DIGIT';
  static CYRIL = 'CYRIL';
  static LATIN = 'LATIN';
  static MIXED = 'MIXED';
  static PUNCT = 'PUNCT';
  static SPACE = 'SPACE';
  static MARKUP = 'MARKUP';
  static NEWLINE = 'NEWLINE';
  static EMAIL = 'EMAIL';
  static LINK = 'LINK';
  static HASHTAG = 'HASHTAG';
  static MENTION = 'MENTION';
  static TAG = 'TAG';
  static CONTENT = 'CONTENT';
  static SCRIPT = 'SCRIPT';
  static STYLE = 'STYLE';
  static COMMENT = 'COMMENT';
  static CLOSING = 'CLOSING';
  static TEMPLATE = 'TEMPLATE';
  static RANGE = 'RANGE';
  static ENTITY = 'ENTITY';

  tokens: Token[] | undefined;
  index: number | undefined;
  source: string | undefined;

  constructor(private text: string, private config?: TokenConfig) {

    if (this instanceof Tokens) {
      this.tokens = [];
      this.source = '';
      if (typeof text == 'string') {
        this.config = config ? AzMorphLoader.extend(defaults_tokens, config) : defaults_tokens;
        this.append(text);
      } else {
        this.config = text ? AzMorphLoader.extend(defaults_tokens, text) : defaults_tokens;
      }
      this.index = -1;
    } else {
      return new Tokens(text, config);
    }
  }


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
  append(text: string, config?: TokenConfig) {
    'use strict';
    // Для производительности:
    // - как можно меньше операций конкатенции/разбивки строк
    // - вместо сравнения всего токена, проверяем соответствующий ему символ в исходной строке
    // - типы токенов - константы в Tokens, формально это строки, но сравниваем через === (как объекты)
    config = config ? AzMorphLoader.extend(this.config as object, config) : this.config;
    if (config && config.links && config.links.tlds) {
      config.links.tlds = defaults_tokens.links.tlds;
    }

    let offs = this.source?.length as number;
    this.source += text;

    let s = this.source as string, ts = this.tokens as Token[];
    for (let i = offs; i < s.length; i++) {
      let ch = s[i];
      let code = s.charCodeAt(i);

      let append = false;
      let last = ts.length - 1;
      let token = ts[last] as Token;
      let st = i;
      if (!config) {
        return;
      }

      if (config.html && (ch == ';')) {
        // &nbsp;
        if ((last > 0) &&
          (token.type === Tokens.WORD) &&
          (ts[last - 1]?.length == 1) &&
          (s[ts[last - 1]!.st] == '&')) {
          let name = token.toLowerCase();
          if (name in HTML_ENTITIES) {
            ch = HTML_ENTITIES[name];
            code = ch!.charCodeAt(0) as number;

            last -= 2;
            token = ts[last] as Token;
            ts.length = last + 1;
          }
        } else
          // &x123AF5;
          // &1234;
          if ((last > 1) &&
            ((token.type === Tokens.NUMBER) ||
              ((token.type === Tokens.WORD) &&
                (s[token.st] == 'x'))) &&
            (ts[last - 1]!.length == 1) &&
            (s[ts[last - 1]!.st] == '#') &&
            (ts[last - 1]!.length == 1) &&
            (s[ts[last - 1]!.st] == '&')) {
            if (s[token.st] == 'x') {
              code = parseInt(token.toString().substr(1), 16);
            } else {
              code = parseInt(token.toString(), 10);
            }
            ch = String.fromCharCode(code);

            last -= 3;
            token = ts[last] as Token;
            ts.length = last + 1;
          }
      }

      let charType = Tokens.OTHER;
      let charUpper = (ch!.toLocaleLowerCase() != ch);
      if (code >= 0x0400 && code <= 0x04FF) charType = Tokens.CYRIL;
      if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A) || (code >= 0x00C0 && code <= 0x024F)) charType = Tokens.LATIN;
      if (code >= 0x0030 && code <= 0x0039) charType = Tokens.DIGIT;
      if ((code <= 0x0020) || (code >= 0x0080 && code <= 0x00A0)) charType = Tokens.SPACE;
      if ('‐-−‒–—―.…,:;?!¿¡()[]«»"\'’‘’“”/⁄'.indexOf(ch!) > -1) charType = Tokens.PUNCT;

      let tokenType = charType;
      let tokenSubType: boolean | string = false;
      if (charType === Tokens.CYRIL || charType === Tokens.LATIN) {
        tokenType = Tokens.WORD;
        tokenSubType = charType;
      } else
        if (charType === Tokens.DIGIT) {
          tokenType = Tokens.NUMBER;
        }

      let lineStart = !token || (s[token.st + token.length - 1] == '\n');
      if (config.wiki) {
        if (lineStart) {
          if (':;*#~|'.indexOf(ch!) > -1) {
            tokenType = Tokens.MARKUP;
            tokenSubType = Tokens.NEWLINE;
          }
        }
        if ('={[|]}'.indexOf(ch!) > -1) {
          tokenType = Tokens.MARKUP;
        }
      }

      if (config.markdown) {
        if (lineStart) {
          if ('=-#>+-'.indexOf(ch!) > -1) {
            tokenType = Tokens.MARKUP;
            tokenSubType = Tokens.NEWLINE;
          }
        }
        if ('[]*~_`\\'.indexOf(ch!) > -1) {
          tokenType = Tokens.MARKUP;
        }
      }

      if (token) {
        if (config.wiki &&
          (ch != "'") &&
          (token.length == 1) &&
          (s[token.st] == "'") &&
          (last > 0) &&
          (ts[last - 1]!.type === Tokens.WORD) &&
          (ts[last - 1]!.subType === Tokens.LATIN)) {
          ts[last - 1]!.length += token.length;

          last -= 1;
          ts.length = last + 1;
          token = ts[last] as Token;
        }

        // Preprocess last token
        if (config.links &&
          config.links.tlds &&
          ((charType === Tokens.PUNCT) ||
            (charType === Tokens.SPACE)) &&
          (ts.length > 2) &&
          (ts[last - 2]!.type === Tokens.WORD) &&
          (ts[last - 1]!.length == 1) &&
          (s[ts[last - 1]!.st] == '.') &&
          (ts[last]!.type === Tokens.WORD) &&
          (token.toString() in config.links.tlds)) {

          // Merge all subdomains
          while ((last >= 2) &&
            (ts[last - 2]!.type === Tokens.WORD) &&
            (ts[last - 1]!.length == 1) &&
            ((s[ts[last - 1]!.st] == '.') ||
              (s[ts[last - 1]!.st] == '@') ||
              (s[ts[last - 1]!.st] == ':'))) {
            last -= 2;
            token = ts[last] as Token;
            token.length += ts[last + 1]!.length + ts[last + 2]!.length;
            token.allUpper = token.allUpper && ts[last + 1]!.allUpper && ts[last + 2]!.allUpper;
          }

          if (config.emails &&
            (token.indexOf('@') > -1) &&
            (token.indexOf(':') == -1)) {
            // URL can contain a '@' but in that case it should be in form http://user@site.com or user:pass@site.com
            // So if URL has a '@' but no ':' in it, we assume it's a email
            token.type = Tokens.EMAIL;
          } else {
            token.type = Tokens.LINK;

            if (ch == '/') {
              append = true;
            }
          }
          ts.length = last + 1;
        } else

          // Process next char (start new token or append to the previous one)
          if (token.type === Tokens.LINK) {
            if ((ch == ')') &&
              (last >= 1) &&
              (ts[last - 1]!.type === Tokens.MARKUP) &&
              (ts[last - 1]!.length == 1) &&
              (s[ts[last - 1]!.st] == '(')) {
              tokenType = Tokens.MARKUP;
            } else
              if ((charType !== Tokens.SPACE) && (ch != ',') && (ch != '<')) {
                append = true;
              }
          } else
            if (token.type === Tokens.EMAIL) {
              if ((charType === Tokens.CYRIL) || (charType === Tokens.LATIN) || (ch == '.')) {
                append = true;
              }
            } else
              if ((token.type === Tokens.HASHTAG) || (token.type === Tokens.MENTION)) {
                if ((charType === Tokens.CYRIL) ||
                  (charType == Tokens.LATIN) ||
                  (charType == Tokens.DIGIT) ||
                  (ch == '_') || ((ch == '@') && (token.indexOf('@') == -1))) {
                  append = true;
                }
              } else
                if ((token.type === Tokens.TAG) && (token.quote || (s[token.en()] != '>'))) {
                  append = true;
                  if (token.quote) {
                    if ((ch == token.quote) && (s[token.en()] != '\\')) {
                      delete token.quote;
                    }
                  } else
                    if ((ch == '"') || (ch == "'")) {
                      token.quote = ch;
                    }
                } else
                  if (token.type === Tokens.CONTENT) {
                    append = true;
                    if (token.quote) {
                      if ((ch == token.quote) && (s[token.en()] != '\\')) {
                        delete token.quote;
                      }
                    } else
                      if ((ch == '"') || (ch == "'")) {
                        token.quote = ch;
                      } else
                        if (ch == '>') {
                          if ((token.length >= 8) && (token.toString().substr(-8) == '</script')) {
                            token.length -= 8;
                            st -= 8;

                            append = false;
                            tokenType = Tokens.TAG;
                            tokenSubType = Tokens.CLOSING;
                          } else
                            if ((token.length >= 7) && (token.toString().substr(-7) == '</style')) {
                              token.length -= 7;
                              st -= 7;

                              append = false;
                              tokenType = Tokens.TAG;
                              tokenSubType = Tokens.CLOSING;
                            }
                        }
                  } else
                    if ((token.type === Tokens.TAG) &&
                      (token.type !== Tokens.CLOSING) &&
                      (token.length >= 8) &&
                      (token.toLowerCase().substr(1, 6) == 'script')) {
                      tokenType = Tokens.CONTENT;
                      tokenSubType = Tokens.SCRIPT;
                    } else
                      if ((token.type === Tokens.TAG) &&
                        (token.type !== Tokens.CLOSING) &&
                        (token.length >= 7) &&
                        (token.toLowerCase().substr(1, 5) == 'style')) {
                        tokenType = Tokens.CONTENT;
                        tokenSubType = Tokens.STYLE;
                      } else
                        if (config.html &&
                          (token.length == 1) &&
                          (s[token.st] == '<') &&
                          ((charType === Tokens.LATIN) || (ch == '!') || (ch == '/'))) {
                          append = true;
                          token.type = Tokens.TAG;
                          if (ch == '!') {
                            token.subType = Tokens.COMMENT;
                          } else
                            if (ch == '/') {
                              token.subType = Tokens.CLOSING;
                            }
                        } else
                          if (token.type === Tokens.CONTENT) {
                            append = true;
                          } else
                            if ((token.type === Tokens.MARKUP) &&
                              (token.subType == Tokens.TEMPLATE) &&
                              ((s[token.en()] != '}') ||
                                (s[token.en() - 1] != '}'))) {
                              append = true;
                            } else
                              if ((token.type === Tokens.MARKUP) &&
                                (token.type === Tokens.LINK) &&
                                (s[token.en()] != ')')) {
                                append = true;
                              } else
                                if ((token.type === Tokens.MARKUP) &&
                                  (s[token.st] == '`') &&
                                  (token.subType === Tokens.NEWLINE) &&
                                  (charType === Tokens.LATIN)) {
                                  append = true;
                                } else
                                  if ((charType === Tokens.CYRIL) || (charType === Tokens.LATIN)) {
                                    if (token.type === Tokens.WORD) {
                                      append = true;
                                      token.subType = (token.subType == charType) ? token.subType : Tokens.MIXED;
                                    } else
                                      if (token.type === Tokens.NUMBER) { // Digits + ending
                                        append = true;
                                        token.subType = (token.subType && token.subType != charType) ? Tokens.MIXED : charType;
                                      } else
                                        if (config.hashtags && (token.length == 1) && (s[token.st] == '#')) { // Hashtags
                                          append = true;
                                          token.type = Tokens.HASHTAG;
                                        } else
                                          if (config.mentions &&
                                            (token.length == 1) &&
                                            (s[token.st] == '@') &&
                                            ((last == 0) || (ts[last - 1]!.type === Tokens.SPACE))) { // Mentions
                                            append = true;
                                            token.type = Tokens.MENTION;
                                          } else
                                            if ((charType === Tokens.LATIN) &&
                                              (token.length == 1) &&
                                              ((s[token.st] == "'") || (s[token.st] == '’'))) {
                                              append = true;
                                              token.type = Tokens.WORD;
                                              token.subType = Tokens.LATIN;
                                            } else
                                              if ((token.length == 1) && (s[token.st] == '-')) { // -цать (?), 3-й
                                                append = true;

                                                if ((last > 0) && (ts[last - 1]!.type === Tokens.NUMBER)) {
                                                  token = ts[last - 1]!;
                                                  token.length += ts[last]!.length;

                                                  ts.length -= 1;
                                                }

                                                token.type = Tokens.WORD;
                                                token.subType = charType;
                                              }
                                  } else
                                    if (charType === Tokens.DIGIT) {
                                      if (token.type === Tokens.WORD) {
                                        append = true;
                                        token.subType = Tokens.MIXED;
                                      } else
                                        if (token.type === Tokens.NUMBER) {
                                          append = true;
                                        } else
                                          if ((token.length == 1) &&
                                            ((s[token.st] == '+') || (s[token.st] == '-'))) {
                                            append = true;

                                            if ((last > 0) && (ts[last - 1]!.type === Tokens.NUMBER)) {
                                              token = ts[last - 1]!;
                                              token.length += ts[last]!.length;
                                              token.subType = Tokens.RANGE;

                                              ts.length -= 1;
                                            }

                                            token.type = Tokens.NUMBER;
                                          } else
                                            if ((token.length == 1) &&
                                              ((s[token.st] == ',') || (s[token.st] == '.')) &&
                                              (ts.length > 1) &&
                                              (ts[last - 1]!.type === Tokens.NUMBER)) {
                                              append = true;

                                              token = ts[last - 1]!;
                                              token.length += ts[last]!.length;

                                              ts.length -= 1;
                                            }
                                    } else
                                      if (charType === Tokens.SPACE) {
                                        if (token.type === Tokens.SPACE) {
                                          append = true;
                                        }
                                      } else
                                        if ((token.type === Tokens.MARKUP) &&
                                          (s[token.st] == ch) &&
                                          ('=-~:*#`\'>_'.indexOf(ch!) > -1)) {
                                          append = true;
                                        } else
                                          if (ch == '.') {
                                            if (config.links &&
                                              config.links.www &&
                                              (token.length == 3) &&
                                              (token.toLowerCase() == 'www')) { // Links without protocol but with www
                                              append = true;
                                              token.type = Tokens.LINK;
                                            }
                                          } else
                                            if (config.wiki && (ch == "'") && (s[token.en()] == "'")) {
                                              if (token.length > 1) {
                                                token.length--;
                                                st--;
                                                tokenType = Tokens.MARKUP;
                                              } else {
                                                append = true;
                                                token.type = Tokens.MARKUP;
                                              }
                                            } else
                                              if ((ch == '-') ||
                                                ((token.subType == Tokens.LATIN) &&
                                                  ((ch == '’') || (ch == "'")))) {
                                                if (token.type === Tokens.WORD) {
                                                  append = true;
                                                }
                                              } else
                                                if (ch == '/') {
                                                  if (config.links &&
                                                    config.links.protocols &&
                                                    (ts.length > 2) &&
                                                    (ts[last - 2]!.type === Tokens.WORD) &&
                                                    (ts[last - 2]!.subType == Tokens.LATIN) &&
                                                    (ts[last - 1]!.length == 1) &&
                                                    (s[ts[last - 1]!.st] == ':') &&
                                                    (ts[last]!.length == 1) &&
                                                    (s[ts[last]!.st] == '/')) { // Links (with protocols)
                                                    append = true;

                                                    token = ts[last - 2]!;
                                                    token.length += ts[last - 1]!.length + ts[last]!.length;
                                                    token.allUpper = token.allUpper && ts[last - 1]!.allUpper && ts[last]!.allUpper;
                                                    token.type = Tokens.LINK;

                                                    ts.length -= 2;
                                                  }
                                                } else
                                                  if (config.html && ch == ';') {
                                                    if ((last > 0) &&
                                                      (token.type === Tokens.WORD) &&
                                                      (ts[last - 1]!.length == 1) &&
                                                      (s[ts[last - 1]!.st] == '&')) {
                                                      append = true;

                                                      token = ts[last - 1]!;
                                                      token.length += ts[last]!.length;
                                                      token.allUpper = token.allUpper && ts[last - 1]!.allUpper;
                                                      token.type = Tokens.ENTITY;

                                                      ts.length -= 1;
                                                    } else
                                                      if ((last > 1) &&
                                                        ((token.type === Tokens.WORD) ||
                                                          (token.type === Tokens.NUMBER)) &&
                                                        (ts[last - 1]!.length == 1) &&
                                                        (s[ts[last - 1]!.st] == '#') &&
                                                        (ts[last - 2]!.length == 1) &&
                                                        (s[ts[last - 2]!.st] == '&')) {
                                                        append = true;

                                                        token = ts[last - 2] as Token;
                                                        token.length += ts[last - 1]!.length + ts[last]!.length;
                                                        token.allUpper = token.allUpper && ts[last - 1]!.allUpper && ts[last]!.allUpper;
                                                        token.type = Tokens.ENTITY;

                                                        ts.length -= 2;
                                                      }
                                                  } else
                                                    if (config.markdown &&
                                                      (ch == '[') &&
                                                      (token.length == 1) &&
                                                      (s[token.st] == '!')) {
                                                      append = true;
                                                      token.type = Tokens.MARKUP;
                                                    } else
                                                      if (config.markdown &&
                                                        (ch == '(') &&
                                                        (token.length == 1) &&
                                                        (s[token.st] == ']')) {
                                                        tokenType = Tokens.MARKUP;
                                                        tokenSubType = Tokens.LINK;
                                                      } else
                                                        if (config.wiki &&
                                                          (ch == '{') &&
                                                          (token.length == 1) &&
                                                          (s[token.st] == '{')) {
                                                          append = true;
                                                          token.type = Tokens.MARKUP;
                                                          token.subType = Tokens.TEMPLATE;
                                                        } else
                                                          if (config.wiki &&
                                                            (ch == '[') &&
                                                            (token.length == 1) &&
                                                            (s[token.st] == '[')) {
                                                            append = true;
                                                          } else
                                                            if (config.wiki &&
                                                              (ch == ']') &&
                                                              (token.length == 1) &&
                                                              (s[token.st] == ']')) {
                                                              append = true;
                                                            } else
                                                              if (config.wiki && (ch == '|') && !lineStart) {
                                                                let found = -1;
                                                                for (let j = last - 1; j >= 0; j--) {
                                                                  if ((ts[j]!.length == 2) &&
                                                                    (s[ts[j]!.st] == '[') &&
                                                                    (s[ts[j]!.st + 1] == '[')) {
                                                                    found = j;
                                                                    break;
                                                                  }
                                                                  if (((ts[j]!.length == 1) &&
                                                                    (s[ts[j]!.st] == '|')) ||
                                                                    ts[j]!.indexOf('\n') > -1) {
                                                                    break;
                                                                  }
                                                                }
                                                                if (found > -1) {
                                                                  append = true;
                                                                  for (let j = last - 1; j >= found; j--) {
                                                                    token = ts[j] as Token;
                                                                    token.length += ts[j + 1]!.length;
                                                                    token.allUpper = token.allUpper && ts[j + 1]!.allUpper;
                                                                  }
                                                                  last = found;
                                                                  ts.length = last + 1;
                                                                  token.subType = Tokens.LINK;
                                                                }
                                                              }
      }

      if (append) {
        token.length++;
        token.allUpper = token.allUpper && charUpper;
      } else {
        token = new Token(s, st, i + 1 - st, ts.length, charUpper, charUpper, tokenType, tokenSubType as string);
        ts.push(token);
      }
    }
    return this;
  }

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
  done(filter?: any, exclude: boolean = false): Token[] {
    // Завершает токенизацию, возвращает список токенов
    // Пока просто возвращает токены, в будущем здесь может быть дополнительная обработка
    if (!filter) {
      return this.tokens as Token[];
    }
    let matcher = getMatcher(filter, exclude);
    let list: Token[] = [];
    for (let i = 0; i < this.tokens!.length; i++) {
      if (matcher(this.tokens![i], i, this.tokens)) {
        list.push(this.tokens![i] as Token);
      }
    }
    return list;
  }


  /**
 * Возвращает токен по его индексу.
 *
 * @param {Function|String[]|Object} [filter] См. описание метода done.
 * @param {boolean} [exclude=False] См. описание метода done.
 * @returns {Token|False} Токен или false, если индекс вышел за пределы массива токенов.
 */
  get(index: number, filter: any, exclude: boolean): Token | boolean {
    if (index < 0) {
      return false;
    }
    if (!filter) {
      return this.tokens![index] as Token;
    }
    let matcher = getMatcher(filter, exclude);
    let idx = 0;
    for (let i = 0; i < this.tokens!.length; i++) {
      if (matcher(this.tokens![i], i, this.tokens)) {
        if (idx == index) {
          return this.tokens![i] as Token;
        }
        idx++;
      }
    }
    return false;
  }

  count(filter: any, exclude: boolean): number {
    if (!filter) {
      return this.tokens!.length;
    }
    let matcher = getMatcher(filter, exclude);
    let count = 0;
    for (let i = 0; i < this.tokens!.length; i++) {
      if (matcher(this.tokens![i], i, this.tokens)) {
        count++;
      }
    }
    return count;
  }

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
  nextToken(moveIndex: boolean, filter: any, exclude: boolean): Token | null {
    let matcher = getMatcher(filter, exclude);
    let index = this.index!;
    index++;
    while (index < this.tokens!.length && matcher(this.tokens![index], index, this.tokens)) {
      index++;
    }
    if (index < this.tokens!.length) {
      if (moveIndex) {
        this.index = index;
      }
      return this.tokens![index] as Token;
    }
    return null;
  }

  /**
 * Проверяет, является ли следующий (за исключением пробелов) токен знаком
 * препинания или нет.
 *
 * @returns {Token|False} False, если следующий токен не является знаком
 *  препинания, либо сам токен в противном случае.
 */
  punctAhead(): Token | boolean {
    let token = this.nextToken(false, ['SPACE'], true) as Token;
    return token && token.type == 'PUNCT' && token;
  }


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
  prevToken(moveIndex: boolean, filter: any, exclude: boolean): Token | null {
    let matcher = getMatcher(filter, exclude);
    let index = this.index as number;
    index--;
    while (index >= 0 && matcher(this.tokens![index], index, this.tokens)) {
      index--;
    }
    if (index >= 0) {
      if (moveIndex) {
        this.index = index;
      }
      return this.tokens![index] as Token;
    }
    return null;
  }


  /**
 * Проверяет, является ли предыдущий (за исключением пробелов) токен знаком
 * препинания или нет.
 *
 * @returns {Token|False} False, если предыдущий токен не является знаком
 *  препинания, либо сам токен в противном случае.
 */
  punctBehind(): Token | boolean {
    let token = this.prevToken(false, ['SPACE'], true) as Token;
    return token && token.type == 'PUNCT' && token;
  }

  /**
 * Проверяет, есть ли впереди текущей позиции токены, удовлетворяющие фильтру.
 *
 * @param {Function|String[]|Object} [filter] См. описание метода done.
 * @param {boolean} [exclude=False] См. описание метода done.
 * @returns {boolean} True если впереди есть хотя бы один подходящий токен,
 *  и False в противном случае.
 */
  hasTokensAhead(filter: any, exclude: boolean): boolean {
    return this.nextToken(false, filter, exclude) != null;
  }

  /**
 * Проверяет, есть ли позади текущей позиции токены, удовлетворяющие фильтру.
 *
 * @param {Function|String[]|Object} [filter] См. описание метода done.
 * @param {boolean} [exclude=False] См. описание метода done.
 * @returns {boolean} True если позади есть хотя бы один подходящий токен,
 *  и False в противном случае.
 */
  hasTokensBehind(filter: any, exclude: boolean): boolean {
    return this.prevToken(false, filter, exclude) != null;
  }

}

function alwaysTrue(): boolean {
  return true;
}

function getMatcher(filter: any, exclude: boolean): any {
  if (!filter) {
    return alwaysTrue();
  }
  if (typeof filter == 'function') {
    return filter;
  }
  let types = filter;
  let exclusive: any;
  if ('length' in filter) {
    exclusive = !exclude;
    types = {};
    for (let i = 0; i < filter.length; i++) {
      types[filter[i]] = true;
    }
  } else {
    exclusive = exclude;
    exclude = false;
  }
  return function (token: any, index: number, array: any) {
    if (token.subType) {
      let sub = token.type + '.' + token.subType;
      if (sub in types) {
        return types[sub] != exclude;
      }
    }
    if (token.type in types) {
      return types[token.type] != exclude;
    } else {
      return !exclusive;
    }
  }
}

export { Tokens };

