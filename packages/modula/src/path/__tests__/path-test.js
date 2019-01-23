import { expect } from 'chai';
import { getIntermidiatePaths } from '..';

describe('getIntermidiatePaths', () => {
  it('returns empty array for empty path', () => {
    expect(getIntermidiatePaths([])).to.deep.equal([[]]);
  });

  it('returns intermidate paths', () => {
    expect(getIntermidiatePaths(['a', 'b', 'c'])).to.deep.equal([
      [],
      ['a'],
      ['a', 'b'],
      ['a', 'b', 'c']
    ]);
  });
});
