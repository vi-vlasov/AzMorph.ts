

/** @namespace azmorph **/
// data/grammemes.ts

import { Settings } from "./azmorph.types";

// --- Глобальные данные для морфологии ---

export const predictionSuffixes: string[] = new Array(3).fill('');
export const prefixes: string[] = ['', 'по', 'наи'];
export let suffixes: any = {}; // TODO: сюда загрузить таблицу суффиксов 
export function setSuffixes(suffixes: any) {
  suffixes = suffixes;
}
export let paradigms: any = [];
export function setParadigms(paradigms: any) {
  paradigms = paradigms;
}
export function getParadigm() {
  return paradigms
}
export let defaults: Settings = {
  ignoreCase: false,
  replacements: { 'е': 'ё' },
  stutter: Infinity,
  typos: 0,
  parsers: [
    'Dictionary?', 'AbbrName?', 'AbbrPatronymic',
    'IntNumber', 'RealNumber', 'Punctuation', 'RomanNumber?', 'Latin',
    'HyphenParticle', 'HyphenAdverb', 'HyphenWords',
    'PrefixKnown', 'PrefixUnknown?', 'SuffixKnown?', 'Abbr'
  ],
  forceParse: false,
  normalizeScore: true
} as Settings;
export function setDefaultsConfig(config: Settings) {
  defaults = config;
}
export const __init: any[] = []; // TODO: список функций инициализации (если нужен)
// Автогенерировано скриптом build-grammemes.ts
export interface Grammeme {
  parent?: string;
  short?: string;
  description?: string;
}

export type Grammemes = string[] | { [key: string]: Grammeme };
export const grammemes: Grammemes = {
  "POST": {
    "short": "ЧР",
    "description": "часть речи"
  },
  "NOUN": {
    "parent": "POST",
    "short": "СУЩ",
    "description": "имя существительное"
  },
  "ADJF": {
    "parent": "POST",
    "short": "ПРИЛ",
    "description": "имя прилагательное (полное)"
  },
  "ADJS": {
    "parent": "POST",
    "short": "КР_ПРИЛ",
    "description": "имя прилагательное (краткое)"
  },
  "COMP": {
    "parent": "POST",
    "short": "КОМП",
    "description": "компаратив"
  },
  "VERB": {
    "parent": "POST",
    "short": "ГЛ",
    "description": "глагол (личная форма)"
  },
  "INFN": {
    "parent": "POST",
    "short": "ИНФ",
    "description": "глагол (инфинитив)"
  },
  "PRTF": {
    "parent": "POST",
    "short": "ПРИЧ",
    "description": "причастие (полное)"
  },
  "PRTS": {
    "parent": "POST",
    "short": "КР_ПРИЧ",
    "description": "причастие (краткое)"
  },
  "GRND": {
    "parent": "POST",
    "short": "ДЕЕПР",
    "description": "деепричастие"
  },
  "NUMR": {
    "parent": "POST",
    "short": "ЧИСЛ",
    "description": "числительное"
  },
  "ADVB": {
    "parent": "POST",
    "short": "Н",
    "description": "наречие"
  },
  "NPRO": {
    "parent": "POST",
    "short": "МС",
    "description": "местоимение-существительное"
  },
  "PRED": {
    "parent": "POST",
    "short": "ПРЕДК",
    "description": "предикатив"
  },
  "PREP": {
    "parent": "POST",
    "short": "ПР",
    "description": "предлог"
  },
  "CONJ": {
    "parent": "POST",
    "short": "СОЮЗ",
    "description": "союз"
  },
  "PRCL": {
    "parent": "POST",
    "short": "ЧАСТ",
    "description": "частица"
  },
  "INTJ": {
    "parent": "POST",
    "short": "МЕЖД",
    "description": "междометие"
  },
  "ANim": {
    "short": "Од-неод",
    "description": "одушевлённость / одушевлённость не выражена"
  },
  "anim": {
    "parent": "ANim",
    "short": "од",
    "description": "одушевлённое"
  },
  "inan": {
    "parent": "ANim",
    "short": "неод",
    "description": "неодушевлённое"
  },
  "GNdr": {
    "short": "хр",
    "description": "род / род не выражен"
  },
  "masc": {
    "parent": "GNdr",
    "short": "мр",
    "description": "мужской род"
  },
  "femn": {
    "parent": "GNdr",
    "short": "жр",
    "description": "женский род"
  },
  "neut": {
    "parent": "GNdr",
    "short": "ср",
    "description": "средний род"
  },
  "Ms-f": {
    "short": "ор",
    "description": "общий род"
  },
  "NMbr": {
    "short": "Число",
    "description": "число"
  },
  "sing": {
    "parent": "NMbr",
    "short": "ед",
    "description": "единственное число"
  },
  "plur": {
    "parent": "NMbr",
    "short": "мн",
    "description": "множественное число"
  },
  "Sgtm": {
    "short": "sg",
    "description": "singularia tantum"
  },
  "Pltm": {
    "short": "pl",
    "description": "pluralia tantum"
  },
  "Fixd": {
    "short": "0",
    "description": "неизменяемое"
  },
  "CAse": {
    "short": "Падеж",
    "description": "категория падежа"
  },
  "nomn": {
    "parent": "CAse",
    "short": "им",
    "description": "именительный падеж"
  },
  "gent": {
    "parent": "CAse",
    "short": "рд",
    "description": "родительный падеж"
  },
  "datv": {
    "parent": "CAse",
    "short": "дт",
    "description": "дательный падеж"
  },
  "accs": {
    "parent": "CAse",
    "short": "вн",
    "description": "винительный падеж"
  },
  "ablt": {
    "parent": "CAse",
    "short": "тв",
    "description": "творительный падеж"
  },
  "loct": {
    "parent": "CAse",
    "short": "пр",
    "description": "предложный падеж"
  },
  "voct": {
    "parent": "nomn",
    "short": "зв",
    "description": "звательный падеж"
  },
  "gen1": {
    "parent": "gent",
    "short": "рд1",
    "description": "первый родительный падеж"
  },
  "gen2": {
    "parent": "gent",
    "short": "рд2",
    "description": "второй родительный (частичный) падеж"
  },
  "acc2": {
    "parent": "accs",
    "short": "вн2",
    "description": "второй винительный падеж"
  },
  "loc1": {
    "parent": "loct",
    "short": "пр1",
    "description": "первый предложный падеж"
  },
  "loc2": {
    "parent": "loct",
    "short": "пр2",
    "description": "второй предложный (местный) падеж"
  },
  "Abbr": {
    "short": "аббр",
    "description": "аббревиатура"
  },
  "Name": {
    "short": "имя",
    "description": "имя"
  },
  "Surn": {
    "short": "фам",
    "description": "фамилия"
  },
  "Patr": {
    "short": "отч",
    "description": "отчество"
  },
  "Geox": {
    "short": "гео",
    "description": "топоним"
  },
  "Orgn": {
    "short": "орг",
    "description": "организация"
  },
  "Trad": {
    "short": "tm",
    "description": "торговая марка"
  },
  "Subx": {
    "short": "субст?",
    "description": "возможна субстантивация"
  },
  "Supr": {
    "short": "превосх",
    "description": "превосходная степень"
  },
  "Qual": {
    "short": "кач",
    "description": "качественное"
  },
  "Apro": {
    "short": "мест-п",
    "description": "местоименное"
  },
  "Anum": {
    "short": "числ-п",
    "description": "порядковое"
  },
  "Poss": {
    "short": "притяж",
    "description": "притяжательное"
  },
  "V-ey": {
    "short": "*ею",
    "description": "форма на -ею"
  },
  "V-oy": {
    "short": "*ою",
    "description": "форма на -ою"
  },
  "Cmp2": {
    "short": "сравн2",
    "description": "сравнительная степень на по-"
  },
  "V-ej": {
    "short": "*ей",
    "description": "форма компаратива на -ей"
  },
  "ASpc": {
    "short": "Вид",
    "description": "категория вида"
  },
  "perf": {
    "parent": "ASpc",
    "short": "сов",
    "description": "совершенный вид"
  },
  "impf": {
    "parent": "ASpc",
    "short": "несов",
    "description": "несовершенный вид"
  },
  "TRns": {
    "short": "Перех",
    "description": "категория переходности"
  },
  "tran": {
    "parent": "TRns",
    "short": "перех",
    "description": "переходный"
  },
  "intr": {
    "parent": "TRns",
    "short": "неперех",
    "description": "непереходный"
  },
  "Impe": {
    "short": "безл",
    "description": "безличный"
  },
  "Impx": {
    "short": "безл?",
    "description": "возможно безличное употребление"
  },
  "Mult": {
    "short": "мног",
    "description": "многократный"
  },
  "Refl": {
    "short": "возвр",
    "description": "возвратный"
  },
  "PErs": {
    "short": "Лицо",
    "description": "категория лица"
  },
  "1per": {
    "parent": "PErs",
    "short": "1л",
    "description": "1 лицо"
  },
  "2per": {
    "parent": "PErs",
    "short": "2л",
    "description": "2 лицо"
  },
  "3per": {
    "parent": "PErs",
    "short": "3л",
    "description": "3 лицо"
  },
  "TEns": {
    "short": "Время",
    "description": "категория времени"
  },
  "pres": {
    "parent": "TEns",
    "short": "наст",
    "description": "настоящее время"
  },
  "past": {
    "parent": "TEns",
    "short": "прош",
    "description": "прошедшее время"
  },
  "futr": {
    "parent": "TEns",
    "short": "буд",
    "description": "будущее время"
  },
  "MOod": {
    "short": "Накл",
    "description": "категория наклонения"
  },
  "indc": {
    "parent": "MOod",
    "short": "изъяв",
    "description": "изъявительное наклонение"
  },
  "impr": {
    "parent": "MOod",
    "short": "повел",
    "description": "повелительное наклонение"
  },
  "INvl": {
    "short": "Совм",
    "description": "категория совместности"
  },
  "incl": {
    "parent": "INvl",
    "short": "вкл",
    "description": "говорящий включён (идем, идемте) "
  },
  "excl": {
    "parent": "INvl",
    "short": "выкл",
    "description": "говорящий не включён в действие (иди, идите)"
  },
  "VOic": {
    "short": "Залог",
    "description": "категория залога"
  },
  "actv": {
    "parent": "VOic",
    "short": "действ",
    "description": "действительный залог"
  },
  "pssv": {
    "parent": "VOic",
    "short": "страд",
    "description": "страдательный залог"
  },
  "Infr": {
    "short": "разг",
    "description": "разговорное"
  },
  "Slng": {
    "short": "жарг",
    "description": "жаргонное"
  },
  "Arch": {
    "short": "арх",
    "description": "устаревшее"
  },
  "Litr": {
    "short": "лит",
    "description": "литературный вариант"
  },
  "Erro": {
    "short": "опеч",
    "description": "опечатка"
  },
  "Dist": {
    "short": "искаж",
    "description": "искажение"
  },
  "Ques": {
    "short": "вопр",
    "description": "вопросительное"
  },
  "Dmns": {
    "short": "указ",
    "description": "указательное"
  },
  "Prnt": {
    "short": "вводн",
    "description": "вводное слово"
  },
  "V-be": {
    "short": "*ье",
    "description": "форма на -ье"
  },
  "V-en": {
    "short": "*енен",
    "description": "форма на -енен"
  },
  "V-ie": {
    "short": "*ие",
    "description": "отчество через -ие-"
  },
  "V-bi": {
    "short": "*ьи",
    "description": "форма на -ьи"
  },
  "Fimp": {
    "short": "*несов",
    "description": "деепричастие от глагола несовершенного вида"
  },
  "Prdx": {
    "short": "предк?",
    "description": "может выступать в роли предикатива"
  },
  "Coun": {
    "short": "счетн",
    "description": "счётная форма"
  },
  "Coll": {
    "short": "собир",
    "description": "собирательное числительное"
  },
  "V-sh": {
    "short": "*ши",
    "description": "деепричастие на -ши"
  },
  "Af-p": {
    "short": "*предл",
    "description": "форма после предлога"
  },
  "Inmx": {
    "short": "не/одуш?",
    "description": "может использоваться как одуш. / неодуш. "
  },
  "Vpre": {
    "short": "в_предл",
    "description": "Вариант предлога ( со, подо, ...)"
  },
  "Anph": {
    "short": "Анаф",
    "description": "Анафорическое (местоимение)"
  },
  "Init": {
    "short": "иниц",
    "description": "Инициал"
  },
  "Adjx": {
    "short": "прил?",
    "description": "может выступать в роли прилагательного"
  }
};
