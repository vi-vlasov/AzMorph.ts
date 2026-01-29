// Тестовый скрипт для проверки сборки
import { Morph, Init } from './dist/index.js';

async function testBuild() {
  try {
    console.log('Инициализация модуля...');
    await Init('dicts');
    console.log('✓ Модуль успешно инициализирован');
    
    console.log('\nТест 1: Разбор русского слова...');
    const result1 = Morph('привет');
    console.log(`✓ Получено ${result1.length} вариантов разбора`);
    console.log(`  Первый вариант: ${result1[0].word}, тег: ${result1[0].tag.toString()}`);
    
    console.log('\nТест 2: Разбор латинского слова...');
    const result2 = Morph('word');
    console.log(`✓ Получено ${result2.length} вариантов разбора`);
    console.log(`  Первый вариант: ${result2[0].word}, тег: ${result2[0].tag.toString()}`);
    
    console.log('\nТест 3: Нормализация...');
    const result3 = Morph('делай');
    const normalized = result3[0].normalize();
    console.log(`✓ Нормализованная форма: ${normalized.toString()}`);
    
    console.log('\n✅ Все тесты сборки прошли успешно!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при тестировании сборки:', error);
    process.exit(1);
  }
}

testBuild();
