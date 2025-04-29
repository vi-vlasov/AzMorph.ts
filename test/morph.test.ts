import { Init, Morph } from '../src/azmorph.morph';

describe('Az.Morph', function () {
  beforeAll(async () => {
    await Init('dicts');
  });
  it('should not parse latin words', function () {
    let result = Morph('word');
    console.log(result);
  });

  it('should parse cyrillic words', function () {
    let result = Morph('привет');
    console.log(result);
  });
});