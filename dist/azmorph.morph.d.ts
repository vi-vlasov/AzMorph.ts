import { defaults } from "./azmorph.grammemes";
import { Settings } from "./azmorph.types";
import { Parse } from "./parsers/azmorph.parser";
type MorphConfig = Partial<typeof defaults>;
export declare const Morph: {
    (word: string, config?: MorphConfig): Parse[];
    Parsers: Record<string, (word: string, config: MorphConfig) => Parse[]>;
    setDefaults(config: Settings): void;
};
/**
 * Инициализирует анализатор, загружая необходимые для работы словари из
 * указанной директории. Эту функцию необходимо вызвать (и дождаться
 * срабатывания коллбэка) до любых действий с модулем.
 *
 * @param {string} [path] Директория, содержащая файлы 'words.dawg',
 * @param {Function} callback Коллбэк, вызываемый после завершения загрузки
 *  всех словарей.
 */
export declare const Init: (path?: string) => Promise<typeof Morph>;
export {};
