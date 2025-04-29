import { Init, Morph } from '../src/azmorph.morph';

describe('Az.Morph', function () {
  beforeAll(async () => {
    await Init('dicts');
  });

  it('should not parse latin words', function () {
    const result = Morph('word');
    expect(result.length).toBeGreaterThan(0); // что-то вернулось
    expect(result[0].tag.LATN).toBeTruthy();   // и это тег LATN
  });

  it('should parse cyrillic words', function () {
    const result = Morph('привет');

    const normalForm = result[0].normalize();
    console.log('Нормальная форма:', normalForm.toString());
    expect(result.length).toBeGreaterThan(0);   // что-то вернулось
    expect(result.some(r => r.tag.POST === 'NOUN' || r.tag.POST === 'ADVB')).toBeTruthy();
    // Проверяем что POST нормальный (например существительное или наречие)
  });

  it('normalize', function () {
    const result = Morph('делай');

    const normalForm = result[0].normalize();
    expect(normalForm.toString()).toBe('делать');
    // Проверяем что POST нормальный (например существительное или наречие)
  });
  it('score', function () {
    const result = Morph('пивет');
    expect(result.length).toBeGreaterThan(0);  // чтобы дальше не крашилось
    const maxScore = Math.max(...result.map(r => r.score || 0));
    console.log('maxScore', maxScore.toFixed(6));
    expect(maxScore).toBeGreaterThan(0);
    // Проверяем что POST нормальный (например существительное или наречие)
  });
});
