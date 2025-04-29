

import { AzMorphLoader } from "./azmorph";
import { __init, initials, knownPrefixes, particles, predictionSuffixes, prefixes } from "./azmorph.constants";
import { Dawg } from "./azmorph.dawg";
import { defaults, getParadigm, grammemes, setDefaultsConfig, setParadigms, setSuffixes } from "./azmorph.grammemes";

import { makeTag, Tag } from "./azmorph.tag";
import { getDictionaryScore, lookup } from "./azmorph.tools";
import { Settings } from "./azmorph.types";
import { CombinedParse } from "./parsers/azmorph.combine";
import { DictionaryParse } from "./parsers/azmorph.dictionary";
import { Parse } from "./parsers/azmorph.parser";


type MorphConfig = Partial<typeof defaults>;

let UNKN: any = {}; // TODO: сюда определить UNKNOWN-значение для слов
let tags: any = []; // TODO: сюда загрузить теги слов 
let probabilities: any = {}; // TODO: сюда загрузить ве  
let words: any = {}; // TODO: сюда загрузить список слов 
let initialized: boolean = false;
export const Morph = (word: string, config: MorphConfig = defaults): Parse[] => {
  if (!initialized) {
    throw new Error('Please call init() before using this module.');
  }

  const finalConfig = AzMorphLoader.extend(defaults, config);
  const parses: Parse[] = [];

  let matched = false;

  for (const parserName of finalConfig.parsers) {
    const isTerminal = parserName.at(-1) !== '?';
    const name = isTerminal ? parserName : parserName.slice(0, -1);

    const parserFn = Morph.Parsers?.[name];
    if (typeof parserFn !== 'function') {
      console.warn(`Parser "${name}" not found. Skipping.`);
      continue;
    }

    const results = parserFn(word, finalConfig);
    for (const parse of results) {
      parse.parser = name;
      if (!parse.stutterCnt && !parse.typosCnt) {
        matched = true;
      }
    }

    parses.push(...results);
    if (matched && isTerminal) break;
  }

  if (!parses.length && finalConfig.forceParse) {
    parses.push(new Parse(word.toLowerCase(), UNKN));
  }

  updateScores(parses);

  if (finalConfig.normalizeScore) {
    normalizeScores(parses);
  }

  parses.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return parses;
};

function updateScores(parses: Parse[]) {
  for (const parse of parses) {
    if (parse.parser === 'Dictionary') {
      const res = probabilities.findAll(`${parse}:${parse.tag}`);
      if (res && res[0]) {
        parse.score = (res[0][1] / 1_000_000) * getDictionaryScore(parse.stutterCnt, parse.typosCnt);
      }
    }
  }
}

function normalizeScores(parses: Parse[]) {
  const groups = {
    dictionary: parses.filter(p => p.parser === 'Dictionary'),
    others: parses.filter(p => p.parser !== 'Dictionary'),
  };

  for (const group of Object.values(groups)) {
    const total = group.reduce((sum, p) => sum + (p.score ?? 0), 0);
    if (!total) continue;

    for (const p of group) {
      p.score = (p.score ?? 0) / total;
    }
  }
}

Morph.Parsers = {} as Record<string, (word: string, config: MorphConfig) => Parse[]>;




__init.push(function () {
  Morph.Parsers.Dictionary = function (word: any, config: any) {
    let isCapitalized: any =
      !config.ignoreCase && word.length &&
      (word[0].toLocaleLowerCase() != word[0]) &&
      (word.substr(1).toLocaleUpperCase() != word.substr(1));
    word = word.toLocaleLowerCase();

    let opts = lookup(words, word, config);

    let lets = [];
    for (let i = 0; i < opts.length; i++) {
      for (let j = 0; j < opts[i][1].length; j++) {
        let w = new DictionaryParse(
          opts[i][0],
          opts[i][1][j][0],
          opts[i][1][j][1],
          opts[i][2],
          opts[i][3], undefined, undefined, tags);
        if (config.ignoreCase || !w.tag.isCapitalized() || isCapitalized) {
          lets.push(w);
        }
      }
    }
    return lets;
  }

  let abbrTags: any = [];
  for (let i = 0; i <= 2; i++) {
    for (let j = 0; j <= 5; j++) {
      for (let k = 0; k <= 1; k++) {
        abbrTags.push(makeTag(
          'NOUN,inan,' + ['masc', 'femn', 'neut'][i] + ',Fixd,Abbr ' + ['sing', 'plur'][k] + ',' + ['nomn', 'gent', 'datv', 'accs', 'ablt', 'loct'][j],
          'СУЩ,неод,' + ['мр', 'жр', 'ср'][i] + ',0,аббр ' + ['ед', 'мн'][k] + ',' + ['им', 'рд', 'дт', 'вн', 'тв', 'пр'][j]
        ));
      }
    }
  }


  // Произвольные аббревиатуры (несклоняемые)
  // ВК, ЖК, ССМО, ОАО, ЛенСпецСМУ
  Morph.Parsers.Abbr = function (word: any, config: any) {
    // Однобуквенные считаются инициалами и для них заведены отдельные парсеры
    if (word.length < 2) {
      return [];
    }
    // Дефисов в аббревиатуре быть не должно
    if (word.indexOf('-') > -1) {
      return [];
    }
    // Первая буква должна быть заглавной: сокращения с маленькой буквы (типа iOS) мало распространены
    // Последняя буква должна быть заглавной: иначе сокращение, вероятно, склоняется
    if ((initials.indexOf(word[0]) > -1) && (initials.indexOf(word[word.length - 1]) > -1)) {
      let caps = 0;
      for (let i = 0; i < word.length; i++) {
        if (initials.indexOf(word[i]) > -1) {
          caps++;
        }
      }
      if (caps <= 5) {
        let lets = [];
        for (let i = 0; i < abbrTags.length; i++) {
          let w = new Parse(word, abbrTags[i], 0.5);
          lets.push(w);
        }
        return lets;
      }
    }
    // При игнорировании регистра разбираем только короткие аббревиатуры
    // (и требуем, чтобы каждая буква была «инициалом», т.е. без мягких/твердых знаков)
    if (!config.ignoreCase || (word.length > 5)) {
      return [];
    }
    word = word.toLocaleUpperCase();
    for (let i = 0; i < word.length; i++) {
      if (initials.indexOf(word[i]) == -1) {
        return [];
      }
    }
    let lets = [];
    for (let i = 0; i < abbrTags.length; i++) {
      let w = new Parse(word, abbrTags[i], 0.2);
      lets.push(w);
    }
    return lets;
  }

  let InitialsParser = function (score: number) {
    let initialsTags: any = [];
    for (let i = 0; i <= 1; i++) {
      for (let j = 0; j <= 5; j++) {
        initialsTags.push(makeTag(
          'NOUN,anim,' + ['masc', 'femn'][i] + ',Sgtm,Name,Fixd,Abbr,Init sing,' + ['nomn', 'gent', 'datv', 'accs', 'ablt', 'loct'][j],
          'СУЩ,од,' + ['мр', 'жр'][i] + ',sg,имя,0,аббр,иниц ед,' + ['им', 'рд', 'дт', 'вн', 'тв', 'пр'][j]
        ));
      }
    }
    return function (word: string, config: any) {
      if (word.length != 1) {
        return [];
      }
      if (config.ignoreCase) {
        word = word.toLocaleUpperCase();
      }
      if (initials.indexOf(word) == -1) {
        return [];
      }
      let lets = [];
      for (let i = 0; i < initialsTags.length; i++) {
        let w = new Parse(word, initialsTags[i], score);
        lets.push(w);
      }
      return lets;
    }
  }

  Morph.Parsers.AbbrName = InitialsParser(0.1);
  Morph.Parsers.AbbrPatronymic = InitialsParser(0.1);

  let RegexpParser = function (regexp: any, tag: any, score: number) {
    return function (word: string, config: any) {
      if (config.ignoreCase) {
        word = word.toLocaleUpperCase();
      }
      if (word.length && word.match(regexp)) {
        return [new Parse(word, tag)];
      } else {
        return [];
      }
    }
  }

  const additionalGrammemes = {
    NUMB: { parent: 'POST' },
    ЧИСЛО: { parent: 'POST' },
    ROMN: { parent: 'POST' },
    РИМ: { parent: 'POST' },
    LATN: { parent: 'POST' },
    ЛАТ: { parent: 'POST' },
    PNCT: { parent: 'POST' },
    ЗПР: { parent: 'POST' },
    UNKN: { parent: 'POST' },
    НЕИЗВ: { parent: 'POST' }
  };

  Object.assign(grammemes, additionalGrammemes);

  Morph.Parsers.IntNumber = RegexpParser(
    /^[−-]?[0-9]+$/,
    makeTag('NUMB,intg', 'ЧИСЛО,цел'), 0.9);

  Morph.Parsers.RealNumber = RegexpParser(
    /^[−-]?([0-9]*[.,][0-9]+)$/,
    makeTag('NUMB,real', 'ЧИСЛО,вещ'), 0.9);

  Morph.Parsers.Punctuation = RegexpParser(
    /^[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+$/,
    makeTag('PNCT', 'ЗПР'), 0.9);

  Morph.Parsers.RomanNumber = RegexpParser(
    /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/,
    makeTag('ROMN', 'РИМ'), 0.9);

  Morph.Parsers.Latin = RegexpParser(
    /[A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u024f]$/,
    makeTag('LATN', 'ЛАТ'), 0.9);

  // слово + частица
  // смотри-ка
  Morph.Parsers.HyphenParticle = function (word: string, config: any) {
    word = word.toLocaleLowerCase();

    let lets = [];
    for (let k = 0; k < particles.length; k++) {
      if (word.substr(word.length - particles[k].length) == particles[k]) {
        let base = word.slice(0, -particles[k].length);
        let opts = lookup(words, base, config);

        //console.log(opts);
        for (let i = 0; i < opts.length; i++) {
          for (let j = 0; j < opts[i][1].length; j++) {
            let w = new DictionaryParse(
              opts[i][0],
              opts[i][1][j][0],
              opts[i][1][j][1],
              opts[i][2],
              opts[i][3],
              '', particles[k], tags);
            w.score *= 0.9;
            lets.push(w);
          }
        }
      }
    }

    return lets;
  }

  let ADVB = makeTag('ADVB', 'Н');

  // 'по-' + прилагательное в дательном падеже
  // по-западному
  Morph.Parsers.HyphenAdverb = function (word: string, config: any) {
    word = word.toLocaleLowerCase();

    if ((word.length < 5) || (word.substr(0, 3) != 'по-')) {
      return [];
    }

    let opts = lookup(words, word.substr(3), config);

    let parses = [];
    let used: any = {};

    for (let i = 0; i < opts.length; i++) {
      if (!used[opts[i][0]]) {
        for (let j = 0; j < opts[i][1].length; j++) {
          let parse: DictionaryParse | Parse = new DictionaryParse(opts[i][0], opts[i][1][j][0], opts[i][1][j][1], opts[i][2], opts[i][3], tags);
          if (parse.matches(['ADJF', 'sing', 'datv'] as any)) {
            used[opts[i][0]] = true;

            parse = new Parse('по-' + opts[i][0], ADVB as Tag, parse.score! * 0.9, opts[i][2], opts[i][3]);
            parses.push(parse);
            break;
          }
        }
      }
    }
    return parses;
  }

  // слово + '-' + слово
  // интернет-магазин
  // компания-производитель
  Morph.Parsers.HyphenWords = function (word: string, config: any) {
    word = word.toLocaleLowerCase();
    for (let i = 0; i < knownPrefixes.length; i++) {
      if (knownPrefixes[i][knownPrefixes[i].length - 1] == '-' &&
        word.substr(0, knownPrefixes[i].length) == knownPrefixes[i]) {
        return [];
      }
    }
    let parses: any = [];
    let parts: any = word.split('-');
    if (parts.length != 2 || !parts[0].length || !parts[1].length) {
      if (parts.length > 2) {
        let end = parts[parts.length - 1];
        let right = Morph.Parsers.Dictionary(end, config);
        for (let j = 0; j < right.length; j++) {
          if (right[j] instanceof DictionaryParse) {
            const dictParse = right[j] as DictionaryParse;
            dictParse.score *= 0.2;
            dictParse.prefix = word.substr(0, word.length - end.length - 1) + '-';
            parses.push(dictParse);
          }
        }
      }
      return parses;
    }
    let left = Morph.Parsers.Dictionary(parts[0], config);
    let right = Morph.Parsers.Dictionary(parts[1], config);


    // letiable
    for (let i = 0; i < left.length; i++) {
      if (left[i].tag.Abbr) {
        continue;
      }
      for (let j = 0; j < right.length; j++) {
        if (!left[i].matches(right[j], ['POST', 'NMbr', 'CAse', 'PErs', 'TEns'])) {
          continue;
        }
        if (left[i].stutterCnt + right[j].stutterCnt > config.stutter ||
          left[i].typosCnt + right[j].typosCnt > config.typos) {
          continue;
        }
        parses.push(new CombinedParse(left[i], right[j]));
      }
    }
    // Fixed
    for (let j = 0; j < right.length; j++) {
      if (right[j] instanceof DictionaryParse) {
        const dictParse = right[j] as DictionaryParse;
        dictParse.score *= 0.3;
        dictParse.prefix = parts[0] + '-';
        parses.push(dictParse);
      }
    }

    return parses;
  }

  Morph.Parsers.PrefixKnown = function (word: any, config: any) {
    let isCapitalized: any =
      !config.ignoreCase && word.length &&
      (word[0].toLocaleLowerCase() != word[0]) &&
      (word.substr(1).toLocaleUpperCase() != word.substr(1));
    word = word.toLocaleLowerCase();
    let parses: any = [];
    for (let i = 0; i < knownPrefixes.length; i++) {
      if (word.length - knownPrefixes[i].length < 3) {
        continue;
      }

      if (word.substr(0, knownPrefixes[i].length) == knownPrefixes[i]) {
        let end = word.substr(knownPrefixes[i].length);
        let right = Morph.Parsers.Dictionary(end, config);
        for (let j = 0; j < right.length; j++) {
          if (!right[j].tag.isProductive()) {
            continue;
          }
          if (!config.ignoreCase && right[j].tag.isCapitalized() && !isCapitalized) {
            continue;
          }
          const dictParse = right[j] as DictionaryParse;
          dictParse.score *= 0.7;
          dictParse.prefix = knownPrefixes[i];
          parses.push(dictParse);
        }
      }
    }
    return parses;
  }

  Morph.Parsers.PrefixUnknown = function (word: any, config: any) {
    let isCapitalized =
      !config.ignoreCase && word.length &&
      (word[0].toLocaleLowerCase() != word[0]) &&
      (word.substr(1).toLocaleUpperCase() != word.substr(1));
    word = word.toLocaleLowerCase();
    let parses: any = [];
    for (let len = 1; len <= 5; len++) {
      if (word.length - len < 3) {
        break;
      }
      let end = word.substr(len);
      let right = Morph.Parsers.Dictionary(end, config);
      for (let j = 0; j < right.length; j++) {
        if (!right[j].tag.isProductive()) {
          continue;
        }
        if (!config.ignoreCase && right[j].tag.isCapitalized() && !isCapitalized) {
          continue;
        }
        const dictParse = right[j] as DictionaryParse;
        dictParse.score *= 0.3;
        dictParse.prefix = word.substr(0, len);
        parses.push(dictParse);
      }
    }
    return parses;
  }

  // Отличие от предсказателя по суффиксам в pymorphy2: найдя подходящий суффикс, проверяем ещё и тот, что на символ короче
  Morph.Parsers.SuffixKnown = function (word: any, config: any) {
    if (word.length < 4) {
      return [];
    }
    let isCapitalized: any =
      !config.ignoreCase && word.length &&
      (word[0].toLocaleLowerCase() != word[0]) &&
      (word.substr(1).toLocaleUpperCase() != word.substr(1));
    word = word.toLocaleLowerCase();
    let parses: any = [];
    let minlen: number = 1;
    let coeffs: any = [0, 0.2, 0.3, 0.4, 0.5, 0.6];
    let used: any = {};
    for (let i = 0; i < prefixes.length; i++) {
      if (prefixes[i].length && (word.substr(0, prefixes[i].length) != prefixes[i])) {
        continue;
      }
      let base = word.substr(prefixes[i].length);
      for (let len = 5; len >= minlen; len--) {
        if (len >= base.length) {
          continue;
        }
        let left = base.substr(0, base.length - len);
        let right = base.substr(base.length - len);
        let entries = predictionSuffixes[i].findAll(right, config.replacements, 0, 0);
        if (!entries) {
          continue;
        }

        let p = [];
        let max = 1;
        for (let j = 0; j < entries.length; j++) {
          let suffix = entries[j][0];
          let stats = entries[j][1];

          for (let k = 0; k < stats.length; k++) {
            let parse = new DictionaryParse(
              prefixes[i] + left + suffix,
              stats[k][1],
              stats[k][2]);
            // Why there is even non-productive forms in suffix DAWGs?
            if (!parse.tag || !parse.tag.isProductive()) {
              continue;
            }
            if (!config.ignoreCase && parse.tag.isCapitalized() && !isCapitalized) {
              continue;
            }
            let key = parse.toString() + ':' + stats[k][1] + ':' + stats[k][2];
            if (key in used) {
              continue;
            }
            max = Math.max(max, stats[k][0]);
            parse.score = stats[k][0] * coeffs[len];
            p.push(parse);
            used[key] = true;
          }
        }
        if (p.length > 0) {
          for (let j = 0; j < p.length; j++) {
            p[j]!.score /= max;
          }
          parses = parses.concat(p);
          // Check also suffixes 1 letter shorter
          minlen = Math.max(len - 1, 1);
        }
      }
    }
    return parses;
  }

  UNKN = makeTag('UNKN', 'НЕИЗВ');
});
/**
 * Задает опции морфологического анализатора по умолчанию.
 *
 * @param {Object} config Опции анализатора.
 * @see Morph
 */
Morph.setDefaults = function (config: Settings) {
  setDefaultsConfig(config);
}

/**
 * Инициализирует анализатор, загружая необходимые для работы словари из
 * указанной директории. Эту функцию необходимо вызвать (и дождаться
 * срабатывания коллбэка) до любых действий с модулем.
 *
 * @param {string} [path] Директория, содержащая файлы 'words.dawg', 
 * @param {Function} callback Коллбэк, вызываемый после завершения загрузки
 *  всех словарей.
 */
export const Init = async (path: string = 'dicts'): Promise<typeof Morph> => {
  const [
    wordsDawg,
    suffixDawg0,
    suffixDawg1,
    suffixDawg2,
    probabilitiesDawg,
    tagsIntJson,
    tagsExtJson,
    suffixesJson,
    paradigmsBuffer
  ] = await Promise.all([
    AzMorphLoader.load(`${path}/words.dawg`, 'arraybuffer'),
    AzMorphLoader.load(`${path}/prediction-suffixes-0.dawg`, 'arraybuffer'),
    AzMorphLoader.load(`${path}/prediction-suffixes-1.dawg`, 'arraybuffer'),
    AzMorphLoader.load(`${path}/prediction-suffixes-2.dawg`, 'arraybuffer'),
    AzMorphLoader.load(`${path}/p_t_given_w.intdawg`, 'arraybuffer'),
    AzMorphLoader.load(`${path}/gramtab-opencorpora-int.json`, 'json'),
    AzMorphLoader.load(`${path}/gramtab-opencorpora-ext.json`, 'json'),
    AzMorphLoader.load(`${path}/suffixes.json`, 'json'),
    AzMorphLoader.load(`${path}/paradigms.array`, 'arraybuffer')
  ]);
  words = Dawg.fromArrayBuffer(wordsDawg as ArrayBufferLike, 'words');
  predictionSuffixes[0] = Dawg.fromArrayBuffer(suffixDawg0 as ArrayBufferLike, 'probs');
  predictionSuffixes[1] = Dawg.fromArrayBuffer(suffixDawg1 as ArrayBufferLike, 'probs');
  predictionSuffixes[2] = Dawg.fromArrayBuffer(suffixDawg2 as ArrayBufferLike, 'probs');
  probabilities = Dawg.fromArrayBuffer(probabilitiesDawg as ArrayBufferLike, 'probs');
  setSuffixes(suffixesJson);

  tags = (tagsIntJson as string[]).map((t, i) => {
    const tag = new Tag(t);
    tag.ext = new Tag((tagsExtJson as string[])[i]);
    return tag;
  })

  Object.freeze(tags);

  {
    const list = new Uint16Array(paradigmsBuffer as ArrayBuffer);
    const count = list[0];
    let pos = 1;
    setParadigms([]);
    for (let i = 0; i < count; i++) {
      const size = list[pos++];
      let local_paradigm = getParadigm();
      local_paradigm.push(list.subarray(pos, pos + size));
      setParadigms(local_paradigm);

      pos += size;
    }
  }

  for (const init of __init) {
    init();
  }

  UNKN = makeTag('UNKN', 'НЕИЗВ');

  initialized = true;
  return Morph;
};


