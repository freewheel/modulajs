import { expect } from 'chai';
import { List } from 'immutable';
import {
  getMountModels,
  getUnmountModels,
  getUpdatedModels,
  getUpdatedModelsInPath,
  minimalChangeSet,
  diff
} from '../diff';
import { Model } from '../../model';

describe('diff', () => {
  class Test extends Model {}

  Test.defaultProps = { name: '' };

  it('get mounted models', () => {
    const model1 = new Test({ name: 'model1' });
    const model2 = new Test({ name: 'model2' });
    const model3 = new Test({ name: 'model3' });

    const oldModels = [model1, model2];
    const newModels = [model1, model2, model3];

    expect(getMountModels(oldModels, newModels)).to.deep.equal([model3]);
  });

  it('get unmounted models', () => {
    const model1 = new Test({ name: 'model1' });
    const model2 = new Test({ name: 'model2' });
    const model3 = new Test({ name: 'model3' });

    const oldModels = [model1, model2, model3];
    const newModels = [model1];

    const unmountedModels = getUnmountModels(oldModels, newModels);

    expect(unmountedModels).to.have.lengthOf(2);
    expect(unmountedModels).to.include.members([model2, model3]);
  });

  it('get updated models', () => {
    const model1 = new Test({ name: 'model1' });
    const model2 = new Test({ name: 'model2' });
    const model3 = new Test({ name: 'model3' });

    const newModel1 = model1.set('name', 'model11');
    const newModel3 = model3.set('name', 'model33');

    const oldModels = [model1, model2, model3];
    const newModels = [newModel1, newModel3];

    const updatedModels = getUpdatedModels(oldModels, newModels);

    expect(updatedModels).to.have.lengthOf(2);
    expect(updatedModels).to.deep.include.members([
      { oldModel: model1, newModel: newModel1 },
      { oldModel: model3, newModel: newModel3 }
    ]);
  });

  it('get updated models in path', () => {
    class Level2Test extends Model {}

    Level2Test.defaultProps = {
      level3: () => new Test()
    };

    class Level1Test extends Model {}

    Level1Test.defaultProps = {
      level2: () => new Level2Test()
    };

    const path = ['level2', 'level3'];
    const oldRootModel = new Level1Test();
    const newRootModel = oldRootModel.updateIn(path, m => m.set('name', 'new'));

    const updatedModels = getUpdatedModelsInPath(
      oldRootModel,
      newRootModel,
      path
    );

    expect(updatedModels).to.have.lengthOf(3);
    expect(updatedModels).to.deep.include.members([
      { oldModel: oldRootModel, newModel: newRootModel },
      {
        oldModel: oldRootModel.get('level2'),
        newModel: newRootModel.get('level2')
      },
      {
        oldModel: oldRootModel.getIn(path),
        newModel: newRootModel.getIn(path)
      }
    ]);
  });

  it('get updated models in path with immutable collection nodes', () => {
    class Level2Test extends Model {}

    Level2Test.defaultProps = {
      level3: () => new Test()
    };

    class Level1Test extends Model {}

    Level1Test.defaultProps = {
      level2List: () => new Level2Test()
    };

    const path = ['level2List', 0, 'level3'];
    const oldRootModel = new Level1Test({
      level2List: List.of(new Level2Test())
    });
    const newRootModel = oldRootModel.updateIn(path, m => m.set('name', 'new'));

    const updatedModels = getUpdatedModelsInPath(
      oldRootModel,
      newRootModel,
      path
    );

    expect(updatedModels).to.have.lengthOf(3);
    expect(updatedModels).to.deep.include.members([
      { oldModel: oldRootModel, newModel: newRootModel },
      {
        oldModel: oldRootModel.getIn(['level2List', 0]),
        newModel: newRootModel.getIn(['level2List', 0])
      },
      {
        oldModel: oldRootModel.getIn(path),
        newModel: newRootModel.getIn(path)
      }
    ]);
  });

  it('find minimal changeset', () => {
    class ToBeCreatedModel extends Model {}
    ToBeCreatedModel.defaultProps = { child: () => new Test() };

    class ToBeDeletedModel extends Model {}
    ToBeDeletedModel.defaultProps = { child: () => new Test() };

    class ParentModel extends Model {}
    ParentModel.defaultProps = { child: () => new Test() };

    class ToBeUpdatedModel extends Model {
      update() {
        const child3 = this.get('child3ThatIsParentModelOfChange');

        return this.setMulti({
          child3ThatIsParentModelOfChange: child3.mutate('child', cm =>
            cm.set('name', 'new')
          ),
          child4ThatToBeCreated: new ToBeCreatedModel(),
          child5ThatToBeDeleted: null
        });
      }
    }
    ToBeUpdatedModel.defaultProps = {
      child1ThatNotChange: () => new Test(),
      child2ThatNotChange: () => new Test(),
      child3ThatIsParentModelOfChange: () => new ParentModel(),
      child4ThatToBeCreated: null,
      child5ThatToBeDeleted: () => new ToBeDeletedModel()
    };

    class RootModel extends Model {
      update() {
        return this.setMulti({
          toBeCreated: new ToBeCreatedModel(),
          toBeDeleted: null,
          toBeUpdated: this.get('toBeUpdated').update()
        });
      }
    }
    RootModel.defaultProps = {
      toBeCreated: null,
      toBeDeleted: () => new ToBeDeletedModel(),
      toBeUpdated: () => new ToBeUpdatedModel()
    };

    const om = new RootModel();
    const nm = om.update();

    const { mountedModels, unmountedModels, updatedModels } = minimalChangeSet(
      om,
      nm
    );

    expect(mountedModels).to.have.lengthOf(4);
    expect(mountedModels).to.include.members([
      nm.get('toBeCreated'),
      nm.getIn(['toBeCreated', 'child']),
      nm.getIn(['toBeUpdated', 'child4ThatToBeCreated']),
      nm.getIn(['toBeUpdated', 'child4ThatToBeCreated', 'child'])
    ]);

    expect(unmountedModels).to.have.lengthOf(4);
    expect(unmountedModels).to.include.members([
      om.get('toBeDeleted'),
      om.getIn(['toBeDeleted', 'child']),
      om.getIn(['toBeUpdated', 'child5ThatToBeDeleted']),
      om.getIn(['toBeUpdated', 'child5ThatToBeDeleted', 'child'])
    ]);

    expect(updatedModels).to.have.lengthOf(3);
    expect(updatedModels).to.deep.include.members([
      { oldModel: om.get('toBeUpdated'), newModel: nm.get('toBeUpdated') },
      {
        oldModel: om.getIn(['toBeUpdated', 'child3ThatIsParentModelOfChange']),
        newModel: nm.getIn(['toBeUpdated', 'child3ThatIsParentModelOfChange'])
      },
      {
        oldModel: om.getIn([
          'toBeUpdated',
          'child3ThatIsParentModelOfChange',
          'child'
        ]),
        newModel: nm.getIn([
          'toBeUpdated',
          'child3ThatIsParentModelOfChange',
          'child'
        ])
      }
    ]);
  });

  it('diff', () => {
    class CountyModel extends Model {}
    CountyModel.defaultProps = {
      name: ''
    };

    class StateModel extends Model {}
    StateModel.defaultProps = {
      name: '',
      counties: () => new List()
    };

    class CountryModel extends Model {}
    CountryModel.defaultProps = {
      name: '',
      states: () => new List()
    };

    const model = new CountryModel({
      name: 'United States',
      states: List.of(
        new StateModel({ name: 'NY' }),
        new StateModel({
          name: 'NJ',
          counties: List.of(
            new CountyModel({ name: 'Union' }),
            new CountyModel({ name: 'Atlantic' })
          )
        })
      )
    });

    const updatedModel = model.updateIn(['states', 1], state =>
      state.set('counties', counties =>
        counties.push(new CountyModel({ name: 'Bergen' }))
      )
    );

    const { mountedModels, unmountedModels, updatedModels } = diff(
      model,
      updatedModel,
      ['states', 1]
    );

    expect(mountedModels).to.have.lengthOf(1);
    expect(unmountedModels).to.have.lengthOf(0);
    expect(updatedModels).to.have.lengthOf(2);
  });
});
