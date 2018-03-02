import { expect } from 'chai';
import sinon from 'sinon';
import { List, fromJS } from 'immutable';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {
  reactionReducer,
  getMountModels,
  getUnmountModels,
  getUpdatedModels,
  getUpdatedModelsInPath,
  diff,
  findMatchedReactions,
  triggerModelLifecycleEvents,
  triggerServicesLifecycleEvents,
  minimalChangeSet
} from '../reaction_reducer';
import { createModel } from '../../model';
import { Debug } from '../../debug';

describe('reactionReducer', () => {
  describe('findMatchedReactions', () => {
    it('returns matched reactions', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvAction1() {
          return {
            type: 'ACTION'
          };
        },

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      });
      const rootModel = new RootModel();
      const action = { type: 'ACTION', path: [] };

      expect(findMatchedReactions(rootModel, action)).to.deep.equal([
        { type: 'ACTION' },
        { type: 'ACTION' }
      ]);
    });

    it('returns empty if there is no model in action.path', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvAction1() {
          return {
            type: 'ACTION'
          };
        },

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      });
      const rootModel = new RootModel();
      const action = { type: 'ACTION', path: ['not', 'exists'] };

      expect(findMatchedReactions(rootModel, action)).to.have.lengthOf(0);
    });
  });

  describe('reducer', () => {
    it('throw error when more than one reactions found for an action', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvAction1() {
          return {
            type: 'ACTION'
          };
        },

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      });
      const rootModel = new RootModel();
      const action = { type: 'ACTION', path: [] };

      expect(() => {
        reactionReducer(rootModel, action);
      }).to.throw(/Unable to handle more than one matched reactions/);
    });

    it('do nothing when zero reactions found for an action', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvAction1() {
          return {
            type: 'ACTION1'
          };
        },

        recvAction2() {
          return {
            type: 'ACTION2'
          };
        }
      });
      const rootModel = new RootModel();
      const action = { type: 'ACTION3', path: [] };
      const [newModel] = reactionReducer(rootModel, action);

      expect(newModel).to.equal(rootModel);
    });

    it('warn when zero reactions found in debug mode', () => {
      Debug.enable();

      const warn = sinon.stub(Debug, 'warn');

      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvAction1() {
          return {
            type: 'ACTION1'
          };
        },

        recvAction2() {
          return {
            type: 'ACTION2'
          };
        }
      });
      const rootModel = new RootModel();
      const action = { type: 'ACTION3', path: [] };
      reactionReducer(rootModel, action);

      Debug.disable();

      expect(warn.calledOnce).to.be.true;
      expect(warn.firstCall.args[0]).to.contains(
        'action does not change the state'
      );
      warn.restore();
    });
  });

  describe('check reaction result', () => {
    it('error when reaction does not return an array', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvSetName() {
          return {
            type: 'SET_NAME',
            update() {
              // do nothing; return nothing
            }
          };
        }
      });

      const rootModel = new RootModel();
      const action = {
        type: 'SET_NAME',
        payload: { name: 'Ben' },
        path: []
      };

      const shouldError = () => reactionReducer(rootModel, action);
      expect(shouldError).to.throw(
        'Reaction for SET_NAME did not return an array. Did you mean `return [ newModel ]`?'
      );
    });

    it('error when reaction returns an empty array in debug mode', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvSetName() {
          return {
            type: 'SET_NAME',
            update() {
              return [];
            }
          };
        }
      });

      const rootModel = new RootModel();
      const action = {
        type: 'SET_NAME',
        payload: { name: 'Ben' },
        path: []
      };

      const shouldError = () => reactionReducer(rootModel, action);
      expect(shouldError).to.throw(
        'Reaction for SET_NAME did not return a new model'
      );
    });

    it('error when reaction returns an empty reaction', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvSetName() {}
      });

      const rootModel = new RootModel();
      const action = {};

      const shouldError = () => reactionReducer(rootModel, action);
      expect(shouldError).to.throw(
        "A receiver in <<anonymous TreeModel>> doesn't return a valid reaction"
      );
    });

    it('error when reaction returns callbacks that are not functions in debug mode', () => {
      const RootModel = createModel({
        propTypes: { name: PropTypes.string },
        defaults: { name: null },

        recvSetName() {
          return {
            type: 'SET_NAME',
            update(model, action) {
              const { name } = action.payload;

              return [
                model.set('name', name),
                'I am a string; I am not a function'
              ];
            }
          };
        }
      });

      const rootModel = new RootModel();
      const action = {
        type: 'SET_NAME',
        payload: { name: 'Ben' },
        path: []
      };

      const shouldError = () => reactionReducer(rootModel, action);
      expect(shouldError).to.throw(
        'Some side effects for SET_NAME are not functions'
      );
    });
  });

  it('apply reaction when only one reaction found for an action', () => {
    const modelDidUpdate = sinon.spy();
    const serviceModelDidUpdate = sinon.spy();
    const sideEffectFunc = sinon.spy();
    const RootModel = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null },

      services: {
        test: function createService() {
          return {
            modelDidUpdate(om, nm) {
              serviceModelDidUpdate(om, nm);
            }
          };
        }
      },

      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      },

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    });

    const rootModel = new RootModel();
    const action = {
      type: 'SET_NAME',
      payload: { name: 'Ben' },
      path: []
    };

    const effects = reactionReducer(rootModel, action);

    expect(effects).to.have.lengthOf(4);

    const [
      newModel,
      sideEffectCallback,
      modelLifecycleCallback,
      servicesLifecycleCallback
    ] = effects;

    expect(newModel.get('name')).to.equal('Ben');
    expect(sideEffectCallback).to.equal(sideEffectFunc);

    return Promise.all([
      modelLifecycleCallback(),
      servicesLifecycleCallback()
    ]).then(() => {
      expect(modelDidUpdate.calledOnce).to.be.true;
      expect(serviceModelDidUpdate.calledOnce).to.be.true;
    });
  });

  it('apply reaction for an imported action', () => {
    const modelDidUpdate = sinon.spy();
    const serviceModelDidUpdate = sinon.spy();
    const sideEffectFunc = sinon.spy();
    const RootModel = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null },

      services: {
        test: function createService() {
          return {
            modelDidUpdate(om, nm) {
              serviceModelDidUpdate(om, nm);
            }
          };
        }
      },

      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      },

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    });

    const rootModel = new RootModel();
    const action = {
      type: 'SET_NAME',
      payload: { name: 'Ben' },
      path: [],
      meta: { imported: true }
    };

    const effects = reactionReducer(rootModel, action);

    expect(effects).to.have.lengthOf(2);

    const [newModel, servicesLifecycleCallback] = effects;

    expect(newModel.get('name')).to.equal('Ben');

    return servicesLifecycleCallback().then(() => {
      expect(modelDidUpdate.notCalled).to.be.true;
      expect(serviceModelDidUpdate.calledOnce).to.be.true;
    });
  });

  it('apply reaction but set model with same old value', () => {
    const modelDidUpdate = sinon.spy();
    const serviceModelDidUpdate = sinon.spy();
    const sideEffectFunc = sinon.spy();
    const RootModel = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: 'Foo' },

      services: {
        test: function createService() {
          return {
            modelDidUpdate(om, nm) {
              serviceModelDidUpdate(om, nm);
            }
          };
        }
      },

      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      },

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    });

    const rootModel = new RootModel();
    const action = {
      type: 'SET_NAME',
      payload: { name: 'Foo' },
      path: []
    };

    const [
      newModel,
      sideEffectCallback,
      modelLifecycleCallback,
      servicesLifecycleCallback
    ] = reactionReducer(rootModel, action);

    expect(newModel).to.equal(rootModel);
    expect(newModel.get('name')).to.equal('Foo');
    expect(sideEffectCallback).to.equal(sideEffectFunc);

    return Promise.all([
      modelLifecycleCallback(),
      servicesLifecycleCallback()
    ]).then(() => {
      expect(modelDidUpdate.called).to.be.false;
      expect(serviceModelDidUpdate.called).to.be.false;
    });
  });

  it('apply reaction but only model local props are set', () => {
    const modelDidUpdate = sinon.spy();
    const serviceModelDidUpdate = sinon.spy();
    const sideEffectFunc = sinon.spy();
    const RootModel = createModel({
      localPropTypes: { name: PropTypes.string },
      defaults: { name: 'Foo' },

      services: {
        test: function createService() {
          return {
            modelDidUpdate(om, nm) {
              serviceModelDidUpdate(om, nm);
            }
          };
        }
      },

      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      },

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    });

    const rootModel = new RootModel();
    const action = {
      type: 'SET_NAME',
      payload: { name: 'Bar' },
      path: []
    };

    const [
      newModel,
      sideEffectCallback,
      modelLifecycleCallback,
      servicesLifecycleCallback
    ] = reactionReducer(rootModel, action);

    expect(newModel).to.equal(rootModel);
    expect(newModel.get('name')).to.equal('Bar');
    expect(sideEffectCallback).to.equal(sideEffectFunc);

    return Promise.all([
      modelLifecycleCallback(),
      servicesLifecycleCallback()
    ]).then(() => {
      expect(modelDidUpdate.called).to.be.false;
      expect(serviceModelDidUpdate.called).to.be.false;
    });
  });

  describe('diff', () => {
    const Model = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: '' }
    });

    it('get mounted models', () => {
      const model1 = new Model({ name: 'model1' });
      const model2 = new Model({ name: 'model2' });
      const model3 = new Model({ name: 'model3' });

      const oldModels = [model1, model2];
      const newModels = [model1, model2, model3];

      expect(getMountModels(oldModels, newModels)).to.deep.equal([model3]);
    });

    it('get unmounted models', () => {
      const model1 = new Model({ name: 'model1' });
      const model2 = new Model({ name: 'model2' });
      const model3 = new Model({ name: 'model3' });

      const oldModels = [model1, model2, model3];
      const newModels = [model1];

      const unmountedModels = getUnmountModels(oldModels, newModels);

      expect(unmountedModels).to.have.lengthOf(2);
      expect(unmountedModels).to.include.members([model2, model3]);
    });

    it('get updated models', () => {
      const model1 = new Model({ name: 'model1' });
      const model2 = new Model({ name: 'model2' });
      const model3 = new Model({ name: 'model3' });

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
      const Level2Model = createModel({
        propTypes: {
          level3: PropTypes.instanceOf(Model)
        },

        defaults: {
          level3: () => new Model()
        }
      });

      const Level1Model = createModel({
        propTypes: {
          level2: PropTypes.instanceOf(Level2Model)
        },

        defaults: {
          level2: () => new Level2Model()
        }
      });

      const path = ['level2', 'level3'];
      const oldRootModel = new Level1Model();
      const newRootModel = oldRootModel.updateIn(path, m =>
        m.set('name', 'new')
      );

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
      const Level2Model = createModel({
        propTypes: {
          level3: PropTypes.instanceOf(Model)
        },

        defaults: {
          level3: () => new Model()
        }
      });

      const Level1Model = createModel({
        propTypes: {
          level2List: ImmutablePropTypes.listOf(
            PropTypes.instanceOf(Level2Model)
          )
        },

        defaults: {
          level2List: () => new List()
        }
      });

      const path = ['level2List', 0, 'level3'];
      const oldRootModel = new Level1Model({
        level2List: List.of(new Level2Model())
      });
      const newRootModel = oldRootModel.updateIn(path, m =>
        m.set('name', 'new')
      );

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
      const ToBeCreatedModel = createModel({
        displayName: 'ToBeCreatedModel',
        propTypes: { child: PropTypes.instanceOf(Model) },
        defaults: { child: () => new Model() }
      });

      const ToBeDeletedModel = createModel({
        displayName: 'ToBeDeletedModel',
        propTypes: { child: PropTypes.instanceOf(Model) },
        defaults: { child: () => new Model() }
      });

      const ParentModel = createModel({
        displayName: 'ParentModel',
        propTypes: { child: PropTypes.instanceOf(Model) },
        defaults: { child: () => new Model() }
      });

      const ToBeUpdatedModel = createModel({
        displayName: 'ToBeUpdatedModel',
        propTypes: {
          child1ThatNotChange: PropTypes.instanceOf(Model),
          child2ThatNotChange: PropTypes.instanceOf(Model),
          child3ThatIsParentModelOfChange: PropTypes.instanceOf(ParentModel),
          child4ThatToBeCreated: PropTypes.instanceOf(ToBeCreatedModel),
          child5ThatToBeDeleted: PropTypes.instanceOf(ToBeDeletedModel)
        },

        defaults: {
          child1ThatNotChange: () => new Model(),
          child2ThatNotChange: () => new Model(),
          child3ThatIsParentModelOfChange: () => new ParentModel(),
          child4ThatToBeCreated: null,
          child5ThatToBeDeleted: () => new ToBeDeletedModel()
        },

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
      });

      const RootModel = createModel({
        displayName: 'RootModel',
        propTypes: {
          toBeCreated: PropTypes.instanceOf(ToBeCreatedModel),
          toBeDeleted: PropTypes.instanceOf(ToBeDeletedModel),
          toBeUpdated: PropTypes.instanceOf(ToBeUpdatedModel)
        },

        defaults: {
          toBeCreated: null,
          toBeDeleted: () => new ToBeDeletedModel(),
          toBeUpdated: () => new ToBeUpdatedModel()
        },

        update() {
          return this.setMulti({
            toBeCreated: new ToBeCreatedModel(),
            toBeDeleted: null,
            toBeUpdated: this.get('toBeUpdated').update()
          });
        }
      });

      const om = new RootModel();
      const nm = om.update();

      const {
        mountedModels,
        unmountedModels,
        updatedModels
      } = minimalChangeSet(om, nm);

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
          oldModel: om.getIn([
            'toBeUpdated',
            'child3ThatIsParentModelOfChange'
          ]),
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
      const CountyModel = createModel({
        displayName: 'CountyModel',

        propTypes: {
          name: PropTypes.string
        },

        defaults: {
          name: ''
        }
      });

      const StateModel = createModel({
        displayName: 'StateModel',

        propTypes: {
          name: PropTypes.string,
          counties: ImmutablePropTypes.listOf(CountyModel)
        },

        defaults: {
          counties: () => new List()
        }
      });

      const CountryModel = createModel({
        displayName: 'CountryModel',

        propTypes: {
          name: PropTypes.string,
          states: ImmutablePropTypes.listOf(StateModel)
        },

        defaults: {
          name: '',
          states: () => new List()
        }
      });

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

  describe('trigger model life cycle events', () => {
    const ChildModel = createModel({
      propTypes: {
        modules: ImmutablePropTypes.list
      },

      defaults: {
        modules: () => new List()
      }
    });

    const RootModel = createModel({
      propTypes: {
        child: PropTypes.instanceOf(ChildModel)
      },

      defaults: {
        child: () => new ChildModel()
      }
    });

    it('trigger modelDidMount', () => {
      const didMount = sinon.spy();

      const Model = createModel({
        modelDidMount() {
          didMount();
        }
      });

      const path = ['child'];
      const oldRootModel = new RootModel();
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.push(new Model()))
      );

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(didMount.calledOnce).to.be.true;
        expect(didMount.calledWith()).to.be.true;
      });
    });

    it('trigger modelDidMount for deeper models', () => {
      const didMount = sinon.spy();

      const ChildModelWithDidMount = createModel({
        modelDidMount() {
          didMount();
        }
      });

      const Model = createModel({
        propTypes: { child: PropTypes.instanceOf(ChildModel) },
        defaults: { child: () => new ChildModelWithDidMount() }
      });

      const path = ['child'];
      const oldRootModel = new RootModel();
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.push(new Model()))
      );

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(didMount.calledOnce).to.be.true;
        expect(didMount.calledWith()).to.be.true;
      });
    });

    it('trigger modelDidUpdate', () => {
      const rootModelDidUpdate = sinon.spy();

      const RootModelWithDidUpdate = createModel({
        displayName: 'RootModelWithDidUpdate',

        propTypes: {
          child: PropTypes.instanceOf(ChildModel)
        },

        defaults: {
          child: () => new ChildModel()
        },

        modelDidUpdate(oldModel, newModel) {
          rootModelDidUpdate(oldModel, newModel);
        }
      });

      const innerModelDidUpdate = sinon.spy();

      const InnerModel = createModel({
        displayName: 'InnerModel',

        propTypes: { name: PropTypes.string },

        defaults: { name: '' },

        modelDidUpdate(oldModel, newModel) {
          innerModelDidUpdate(oldModel, newModel);
        }
      });

      const modelDidUpdate = sinon.spy();

      const Model = createModel({
        displayName: 'Model',

        propTypes: { inner: PropTypes.instanceOf(InnerModel) },

        defaults: { inner: () => new InnerModel() },

        modelDidUpdate(oldModel, newModel) {
          modelDidUpdate(oldModel, newModel);
        }
      });

      const oldModel = new Model();
      const newModel = oldModel.mutate('inner', inner =>
        inner.set('name', 'newName')
      );

      const path = ['child', 'modules', 0];
      const oldRootModel = new RootModelWithDidUpdate({
        child: new ChildModel({
          modules: fromJS([oldModel])
        })
      });
      const newRootModel = oldRootModel.updateIn(path, newModel);

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(innerModelDidUpdate.calledOnce).to.be.true;
        expect(
          innerModelDidUpdate.calledWith(
            oldModel.get('inner'),
            newModel.get('inner')
          )
        ).to.be.true;

        expect(modelDidUpdate.calledOnce).to.be.true;
        expect(modelDidUpdate.calledWith(oldModel, newModel)).to.be.true;

        expect(rootModelDidUpdate.calledOnce).to.be.true;
        expect(rootModelDidUpdate.calledWith(oldRootModel, newRootModel)).to.be
          .true;
      });
    });

    it('trigger modelDidUpdate for deeper models', () => {
      const RootModelWithDidUpdate = createModel({
        propTypes: {
          child: PropTypes.instanceOf(ChildModel)
        },

        defaults: {
          child: () => new ChildModel()
        }
      });

      const innerToBeCreatedModelDidMount = sinon.spy();

      const InnerToBeCreatedModel = createModel({
        modelDidMount() {
          innerToBeCreatedModelDidMount();
        }
      });

      const innerToBeDeletedModelWillUnmount = sinon.spy();

      const InnerToBeDeletedModel = createModel({
        modelWillUnmount() {
          innerToBeDeletedModelWillUnmount();
        }
      });

      const innerToBeUpdatedModelDidUpdate = sinon.spy();

      const InnerToBeUpdatedModel = createModel({
        propTypes: { name: PropTypes.string },

        defaults: { name: '' },

        modelDidUpdate(o, n) {
          innerToBeUpdatedModelDidUpdate(o, n);
        }
      });

      const InnerModel = createModel({
        propTypes: {
          toBeCreated: PropTypes.instanceOf(InnerToBeCreatedModel),
          toBeDeleted: PropTypes.instanceOf(InnerToBeDeletedModel),
          toBeUpdated: PropTypes.instanceOf(InnerToBeUpdatedModel)
        },

        defaults: {
          toBeCreated: null,
          toBeDeleted: () => new InnerToBeDeletedModel(),
          toBeUpdated: () => new InnerToBeUpdatedModel({ name: 'old' })
        },

        update() {
          return this.setMulti({
            toBeCreated: new InnerToBeCreatedModel(),
            toBeDeleted: null,
            toBeUpdated: this.get('toBeUpdated').set('name', 'new')
          });
        }
      });

      const Model = createModel({
        propTypes: { child: PropTypes.instanceOf(InnerModel) },

        defaults: { child: () => new InnerModel() }
      });

      const oldModel = new Model();
      const newModel = oldModel.mutate('child', child => child.update());

      const path = ['child', 'modules', 0];
      const oldRootModel = new RootModelWithDidUpdate({
        child: new ChildModel({
          modules: fromJS([oldModel])
        })
      });
      const newRootModel = oldRootModel.updateIn(path, newModel);

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(innerToBeCreatedModelDidMount.calledOnce).to.be.true;
        expect(innerToBeCreatedModelDidMount.calledWith()).to.be.true;

        expect(innerToBeDeletedModelWillUnmount.calledOnce).to.be.true;
        expect(innerToBeDeletedModelWillUnmount.calledWith()).to.be.true;

        expect(innerToBeUpdatedModelDidUpdate.calledOnce).to.be.true;
        expect(
          innerToBeUpdatedModelDidUpdate.calledWith(
            oldModel.getIn(['child', 'toBeUpdated']),
            newModel.getIn(['child', 'toBeUpdated'])
          )
        ).to.be.true;
      });
    });

    it('trigger modelWillUnmount', () => {
      const didUnmount = sinon.spy();

      const Model = createModel({
        modelWillUnmount() {
          didUnmount();
        }
      });

      const path = ['child'];
      const oldRootModel = new RootModel({
        child: new ChildModel({
          modules: fromJS([new Model()])
        })
      });
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.pop())
      );

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(didUnmount.calledOnce).to.be.true;
        expect(didUnmount.calledWith()).to.be.true;
      });
    });

    it('trigger modelWillUnmount', () => {
      const didUnmount = sinon.spy();

      const Model = createModel({
        modelWillUnmount() {
          didUnmount();
        }
      });

      const path = ['child'];
      const oldRootModel = new RootModel({
        child: new ChildModel({
          modules: fromJS([new Model()])
        })
      });
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.pop())
      );

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(didUnmount.calledOnce).to.be.true;
        expect(didUnmount.calledWith()).to.be.true;
      });
    });

    it('trigger modelWillUnmount for deep models', () => {
      const didUnmount = sinon.spy();

      const InnerModel = createModel({
        modelWillUnmount() {
          didUnmount();
        }
      });

      const Model = createModel({
        propTypes: { child: PropTypes.instanceOf(InnerModel) },
        defaults: { child: () => new InnerModel() }
      });

      const path = ['child'];
      const oldRootModel = new RootModel({
        child: new ChildModel({
          modules: fromJS([new Model()])
        })
      });
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.pop())
      );

      const { mountedModels, unmountedModels, updatedModels } = diff(
        oldRootModel,
        newRootModel,
        path
      );

      return triggerModelLifecycleEvents(
        mountedModels,
        unmountedModels,
        updatedModels
      ).then(() => {
        expect(didUnmount.calledOnce).to.be.true;
        expect(didUnmount.calledWith()).to.be.true;
      });
    });

    describe('trigger services life cycle events', () => {
      it('trigger service modelDidMount', () => {
        const spy = sinon.spy();

        const ServiceChildModel = createModel({
          propTypes: { name: PropTypes.string },
          defaults: { name: '' },

          services: {
            test: function createService() {
              return {
                modelDidMount() {
                  spy();
                }
              };
            }
          }
        });

        const ServiceParentModel = createModel({
          propTypes: {
            list: ImmutablePropTypes.listOf(ServiceChildModel)
          },

          defaults: {
            list: () => new List()
          }
        });

        const model = new ServiceParentModel();
        const updatedModel = model.set('list', l =>
          l.push(new ServiceChildModel())
        );

        const { mountedModels, unmountedModels, updatedModels } = diff(
          model,
          updatedModel,
          []
        );

        return triggerServicesLifecycleEvents(
          mountedModels,
          unmountedModels,
          updatedModels
        ).then(() => {
          expect(spy.calledOnce).to.be.true;
        });
      });

      it('trigger service modelWillUnmount', () => {
        const spy = sinon.spy();

        const ServiceChildModel = createModel({
          propTypes: { name: PropTypes.string },
          defaults: { name: '' },

          services: {
            test: function createService() {
              return {
                modelWillUnmount() {
                  spy();
                }
              };
            }
          }
        });

        const ServiceParentModel = createModel({
          propTypes: {
            list: ImmutablePropTypes.listOf(ServiceChildModel)
          },

          defaults: {
            list: () => new List()
          }
        });

        const model = new ServiceParentModel({
          list: List.of(new ServiceChildModel())
        });
        const updatedModel = model.set('list', new List());

        const { mountedModels, unmountedModels, updatedModels } = diff(
          model,
          updatedModel,
          []
        );

        return triggerServicesLifecycleEvents(
          mountedModels,
          unmountedModels,
          updatedModels
        ).then(() => {
          expect(spy.calledOnce).to.be.true;
        });
      });

      it('trigger service modelWillUpdate', () => {
        const spy = sinon.spy();

        const ServiceChildModel = createModel({
          propTypes: { name: PropTypes.string },
          defaults: { name: '' },

          services: {
            test: function createService() {
              return {
                modelDidUpdate(oldModel, newModel) {
                  spy(oldModel, newModel);
                }
              };
            }
          }
        });

        const ServiceParentModel = createModel({
          propTypes: {
            list: ImmutablePropTypes.listOf(ServiceChildModel)
          },

          defaults: {
            list: () => new List()
          }
        });

        const model = new ServiceParentModel({
          list: List.of(new ServiceChildModel())
        });
        const updatedModel = model.updateIn(['list', 0], c =>
          c.set('name', 'new')
        );

        const { mountedModels, unmountedModels, updatedModels } = diff(
          model,
          updatedModel,
          []
        );

        return triggerServicesLifecycleEvents(
          mountedModels,
          unmountedModels,
          updatedModels
        ).then(() => {
          expect(spy.calledOnce).to.be.true;
          expect(
            spy.calledWith(
              model.getIn(['list', 0]),
              updatedModel.getIn(['list', 0])
            )
          ).to.be.true;
        });
      });
    });
  });
});
