import { expect } from 'chai';
import { always } from 'ramda';
import { Model } from '../../model';
import withSet from '../with_set';

describe('with set', () => {
  it('return a new model called with set', () => {
    class TestModel extends Model {}
    TestModel.defaultProps = {
      name: 'aa'
    };

    const model = new TestModel();

    const [newModel] = withSet('name', always('bb'))(model);

    expect(newModel.get('name')).to.eq('bb');
  });
});
