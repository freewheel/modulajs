import { expect } from 'chai';
import { evolve, always } from 'ramda';
import { Model } from '../../model';
import withSetMulti from '../with_set_multi';

describe('with setMulti', () => {
  it('return a new model called with setMulti', () => {
    class TestModel extends Model {}
    TestModel.defaultProps = {
      name: 'aa'
    };

    const model = new TestModel();

    const [newModel] = withSetMulti(evolve({ name: always('bb') }))(model);

    expect(newModel.get('name')).to.eq('bb');
  });
});
