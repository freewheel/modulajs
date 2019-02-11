import { expect } from 'chai';
import sinon from 'sinon';
import { List, fromJS } from 'immutable';
import {
  reactionReducer,
  findMatchedReactions,
  atomUpdate,
  triggerModelLifecycleEvents,
  triggerServicesLifecycleEvents
} from '../reaction_reducer';
import { diff } from '../../diff';
import { Model } from '../../model';

describe('reactionReducer', () => {
  describe('findMatchedReactions', () => {
    it('returns matched reactions', () => {
      class RootModel extends Model {
        recvAction1() {
          return {
            type: 'ACTION'
          };
        }

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      }

      const rootModel = new RootModel();
      const action = { type: 'ACTION', path: [] };

      expect(findMatchedReactions(rootModel, action)).to.deep.equal([
        { type: 'ACTION' },
        { type: 'ACTION' }
      ]);
    });

    it('returns empty if there is no model in action.path', () => {
      class RootModel extends Model {
        recvAction1() {
          return {
            type: 'ACTION'
          };
        }

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      }

      const rootModel = new RootModel();
      const action = { type: 'ACTION', path: ['not', 'exists'] };

      expect(findMatchedReactions(rootModel, action)).to.have.lengthOf(0);
    });
  });

  describe('reducer', () => {
    it('throw error when more than one reactions found for an action', () => {
      class RootModel extends Model {
        recvAction1() {
          return {
            type: 'ACTION'
          };
        }

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      }

      const rootModel = new RootModel();
      const action = { type: 'ACTION', path: [] };

      expect(() => {
        reactionReducer(rootModel, action);
      }).to.throw(/Unable to handle more than one matched reactions/);
    });

    it('do nothing when zero reactions found for an action', () => {
      class RootModel extends Model {
        recvAction1() {
          return {
            type: 'ACTION'
          };
        }

        recvAction2() {
          return {
            type: 'ACTION'
          };
        }
      }

      const rootModel = new RootModel();
      const action = { type: 'ACTION3', path: [] };
      const [newModel] = reactionReducer(rootModel, action);

      expect(newModel).to.equal(rootModel);
    });
  });

  describe('check reaction result', () => {
    it('error when reaction does not return an array', () => {
      class RootModel extends Model {
        recvSetName() {
          return {
            type: 'SET_NAME',
            update() {
              // do nothing; return nothing
            }
          };
        }
      }

      const rootModel = new RootModel();
      const action = {
        type: 'SET_NAME',
        payload: { name: 'Ben' },
        path: []
      };

      const shouldError = () => reactionReducer(rootModel, action);
      expect(shouldError).to.throw(
        `Reaction for SET_NAME did not return an array. Did you mean \`return [ newModel ]\`?`
      );
    });

    it('error when reaction returns an empty array in debug mode', () => {
      class RootModel extends Model {
        recvSetName() {
          return {
            type: 'SET_NAME',
            update() {
              return [];
            }
          };
        }
      }

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
      class RootModel extends Model {
        recvSetName() {}
      }

      const rootModel = new RootModel();
      const action = { path: [] };

      const shouldError = () => reactionReducer(rootModel, action);

      expect(shouldError).to.throw(
        "A receiver in RootModel doesn't return a valid reaction"
      );
    });

    it('error when reaction returns callbacks that are not functions in debug mode', () => {
      class RootModel extends Model {
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
      }

      RootModel.defaultProps = { name: '' };

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

    class RootModel extends Model {
      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      }

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    }

    RootModel.defaultProps = { name: '' };
    RootModel.services = {
      test: () => ({
        modelDidUpdate(om, nm) {
          serviceModelDidUpdate(om, nm);
        }
      })
    };

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

    class RootModel extends Model {
      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      }

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    }

    RootModel.defaultProps = { name: '' };
    RootModel.services = {
      test: () => ({
        modelDidUpdate(om, nm) {
          serviceModelDidUpdate(om, nm);
        }
      })
    };

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

    class RootModel extends Model {
      modelDidUpdate(om, nm) {
        modelDidUpdate(om, nm);
      }

      recvSetName() {
        return {
          type: 'SET_NAME',
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name), sideEffectFunc];
          }
        };
      }
    }

    RootModel.defaultProps = { name: '' };
    RootModel.services = {
      test: () => ({
        modelDidUpdate(om, nm) {
          serviceModelDidUpdate(om, nm);
        }
      })
    };

    const rootModel = new RootModel({ name: 'Foo' });
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

  describe('trigger model life cycle events', () => {
    class ChildModel extends Model {}
    ChildModel.defaultProps = {
      modules: () => new List()
    };

    class RootModel extends Model {}
    RootModel.defaultProps = {
      child: () => new ChildModel()
    };

    it('trigger modelDidMount', () => {
      const didMount = sinon.spy();

      class Test extends Model {
        modelDidMount() {
          didMount();
        }
      }

      const path = ['child'];
      const oldRootModel = new RootModel();
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.push(new Test()))
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

      class ChildModelWithDidMount extends Model {
        modelDidMount() {
          didMount();
        }
      }

      class Test extends Model {}
      Test.defaultProps = { child: () => new ChildModelWithDidMount() };

      const path = ['child'];
      const oldRootModel = new RootModel();
      const newRootModel = oldRootModel.updateIn(path, child =>
        child.mutate('modules', m => m.push(new Test()))
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

    it('trigger modelWillUpdate', () => {
      const lv3ModelWillUpdateSpy = sinon.spy();
      const lv2ModelWillUpdateSpy = sinon.spy();
      const lv1ModelWillUpdateSpy = sinon.spy();
      const rootModelWillUpdateSpy = sinon.spy();

      class Level3ChildModelWithWillUpdate extends Model {
        modelWillUpdate(oldModel) {
          lv3ModelWillUpdateSpy(oldModel);
          if (oldModel.get('likes') !== this.get('likes')) {
            return this.set('name', 'liked-lv3');
          } else {
            return this;
          }
        }
      }
      Level3ChildModelWithWillUpdate.defaultProps = {
        name: 'lv3',
        likes: 0
      };

      class Level2ChildModelWithWillUpdate extends Model {
        modelWillUpdate(oldModel) {
          lv2ModelWillUpdateSpy(oldModel);
          if (oldModel.get('likes') !== this.get('likes')) {
            return this.set('name', 'liked-lv2');
          } else {
            return this;
          }
        }
      }
      Level2ChildModelWithWillUpdate.defaultProps = {
        name: 'lv2',
        childObject: () => ({
          child: new Level3ChildModelWithWillUpdate()
        }),
        likes: 0
      };

      class Level1ChildModelWithWillUpdate extends Model {
        modelWillUpdate(oldModel) {
          lv1ModelWillUpdateSpy(oldModel);
          if (oldModel.get('likes') !== this.get('likes')) {
            return this.set('name', 'liked-lv1');
          } else {
            return this;
          }
        }
      }
      Level1ChildModelWithWillUpdate.defaultProps = {
        name: 'lv1',
        likes: 0,
        childArray: () => [new Level2ChildModelWithWillUpdate()]
      };

      class RootModelWithWillUpdate extends Model {
        modelWillUpdate(oldModel) {
          rootModelWillUpdateSpy(oldModel);
          if (oldModel.get('likes') !== this.get('likes')) {
            return this.set('name', 'liked-root');
          } else {
            return this;
          }
        }
      }
      RootModelWithWillUpdate.defaultProps = {
        name: 'root',
        likes: 0,
        child: () => new Level1ChildModelWithWillUpdate()
      };

      const oldRoot = new RootModelWithWillUpdate();

      const pathLv1 = ['child'];
      const pathLv2 = ['child', 'childArray', 0];
      const pathLv3 = ['child', 'childArray', 0, 'childObject', 'child'];

      const resultRoot = atomUpdate(oldRoot, [], oldRoot.set('likes', 1));
      expect(rootModelWillUpdateSpy.callCount).to.eq(1);
      expect(rootModelWillUpdateSpy.calledWith(oldRoot)).to.be.true;
      expect(lv1ModelWillUpdateSpy.callCount).to.eq(0);
      expect(lv2ModelWillUpdateSpy.callCount).to.eq(0);
      expect(lv3ModelWillUpdateSpy.callCount).to.eq(0);
      expect(resultRoot.get('name')).to.eq('liked-root');

      rootModelWillUpdateSpy.resetHistory();
      lv1ModelWillUpdateSpy.resetHistory();
      lv2ModelWillUpdateSpy.resetHistory();
      lv3ModelWillUpdateSpy.resetHistory();

      const resultLv1 = atomUpdate(
        oldRoot,
        pathLv1,
        oldRoot.getIn(pathLv1).set('likes', 1)
      );
      expect(rootModelWillUpdateSpy.callCount).to.eq(1);
      expect(rootModelWillUpdateSpy.calledWith(oldRoot));
      expect(lv1ModelWillUpdateSpy.callCount).to.eq(1);
      expect(lv1ModelWillUpdateSpy.calledWith(oldRoot.getIn(pathLv1))).to.be
        .true;
      expect(lv2ModelWillUpdateSpy.callCount).to.eq(0);
      expect(lv3ModelWillUpdateSpy.callCount).to.eq(0);
      expect(resultLv1.get('name')).to.eq('root');
      expect(resultLv1.getIn(pathLv1).get('name')).to.eq('liked-lv1');

      rootModelWillUpdateSpy.resetHistory();
      lv1ModelWillUpdateSpy.resetHistory();
      lv2ModelWillUpdateSpy.resetHistory();
      lv3ModelWillUpdateSpy.resetHistory();

      const resultLv2 = atomUpdate(
        oldRoot,
        pathLv2,
        oldRoot.getIn(pathLv2).set('likes', 1)
      );
      expect(rootModelWillUpdateSpy.callCount).to.eq(1);
      expect(rootModelWillUpdateSpy.calledWith(oldRoot));
      expect(lv1ModelWillUpdateSpy.callCount).to.eq(1);
      expect(lv1ModelWillUpdateSpy.calledWith(oldRoot.getIn(pathLv1))).to.be
        .true;
      expect(lv2ModelWillUpdateSpy.callCount).to.eq(1);
      expect(lv2ModelWillUpdateSpy.calledWith(oldRoot.getIn(pathLv2))).to.be
        .true;
      expect(lv3ModelWillUpdateSpy.callCount).to.eq(0);
      expect(resultLv2.get('name')).to.eq('root');
      expect(resultLv2.getIn(pathLv1).get('name')).to.eq('lv1');
      expect(resultLv2.getIn(pathLv2).get('name')).to.eq('liked-lv2');

      rootModelWillUpdateSpy.resetHistory();
      lv1ModelWillUpdateSpy.resetHistory();
      lv2ModelWillUpdateSpy.resetHistory();
      lv3ModelWillUpdateSpy.resetHistory();

      const resultLv3 = atomUpdate(
        oldRoot,
        pathLv3,
        oldRoot.getIn(pathLv3).set('likes', 1)
      );
      expect(rootModelWillUpdateSpy.callCount).to.eq(1);
      expect(rootModelWillUpdateSpy.calledWith(oldRoot));
      expect(lv1ModelWillUpdateSpy.callCount).to.eq(1);
      expect(lv1ModelWillUpdateSpy.calledWith(oldRoot.getIn(pathLv1))).to.be
        .true;
      expect(lv2ModelWillUpdateSpy.callCount).to.eq(1);
      expect(lv2ModelWillUpdateSpy.calledWith(oldRoot.getIn(pathLv2))).to.be
        .true;
      expect(lv3ModelWillUpdateSpy.callCount).to.eq(1);
      expect(lv3ModelWillUpdateSpy.calledWith(oldRoot.getIn(pathLv3))).to.be
        .true;
      expect(resultLv3.get('name')).to.eq('root');
      expect(resultLv3.getIn(pathLv1).get('name')).to.eq('lv1');
      expect(resultLv3.getIn(pathLv2).get('name')).to.eq('lv2');
      expect(resultLv3.getIn(pathLv3).get('name')).to.eq('liked-lv3');
    });

    it('trigger modelDidUpdate', () => {
      const rootModelDidUpdate = sinon.spy();

      class RootModelWithDidUpdate extends Model {
        modelDidUpdate(oldModel, newModel) {
          rootModelDidUpdate(oldModel, newModel);
        }
      }

      RootModelWithDidUpdate.defaultProps = {
        child: () => new ChildModel()
      };

      const innerModelDidUpdate = sinon.spy();

      class InnerModel extends Model {
        modelDidUpdate(oldModel, newModel) {
          innerModelDidUpdate(oldModel, newModel);
        }
      }

      InnerModel.defaultProps = { name: '' };

      const modelDidUpdate = sinon.spy();

      class Test extends Model {
        modelDidUpdate(oldModel, newModel) {
          modelDidUpdate(oldModel, newModel);
        }
      }
      Test.defaultProps = { inner: () => new InnerModel() };

      const oldModel = new Test();
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
      class RootModelWithDidUpdate extends Model {}
      RootModelWithDidUpdate.defaultProps = {
        child: () => new ChildModel()
      };

      const innerToBeCreatedModelDidMount = sinon.spy();

      class InnerToBeCreatedModel extends Model {
        modelDidMount() {
          innerToBeCreatedModelDidMount();
        }
      }

      const innerToBeDeletedModelWillUnmount = sinon.spy();

      class InnerToBeDeletedModel extends Model {
        modelWillUnmount() {
          innerToBeDeletedModelWillUnmount();
        }
      }

      const innerToBeUpdatedModelDidUpdate = sinon.spy();

      class InnerToBeUpdatedModel extends Model {
        modelDidUpdate(o, n) {
          innerToBeUpdatedModelDidUpdate(o, n);
        }
      }
      InnerToBeUpdatedModel.defaultProps = { name: '' };

      class InnerModel extends Model {
        update() {
          return this.setMulti({
            toBeCreated: new InnerToBeCreatedModel(),
            toBeDeleted: null,
            toBeUpdated: this.get('toBeUpdated').set('name', 'new')
          });
        }
      }
      InnerModel.defaultProps = {
        toBeCreated: null,
        toBeDeleted: () => new InnerToBeDeletedModel(),
        toBeUpdated: () => new InnerToBeUpdatedModel({ name: 'old' })
      };

      class Test extends Model {}
      Test.defaultProps = { child: () => new InnerModel() };

      const oldModel = new Test();
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

      class Test extends Model {
        modelWillUnmount() {
          didUnmount();
        }
      }

      const path = ['child'];
      const oldRootModel = new RootModel({
        child: new ChildModel({
          modules: fromJS([new Test()])
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

      class Test extends Model {
        modelWillUnmount() {
          didUnmount();
        }
      }

      const path = ['child'];
      const oldRootModel = new RootModel({
        child: new ChildModel({
          modules: fromJS([new Test()])
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

      class InnerModel extends Model {
        modelWillUnmount() {
          didUnmount();
        }
      }

      class Test extends Model {}
      Test.defaultProps = { child: () => new InnerModel() };

      const path = ['child'];
      const oldRootModel = new RootModel({
        child: new ChildModel({
          modules: fromJS([new Test()])
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

        class ServiceChildModel extends Model {}
        ServiceChildModel.defaultProps = { name: '' };
        ServiceChildModel.services = {
          test: () => ({
            modelDidMount() {
              spy();
            }
          })
        };

        class ServiceParentModel extends Model {}

        ServiceParentModel.defaultProps = {
          list: () => new List()
        };

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

        class ServiceChildModel extends Model {}
        ServiceChildModel.defaultProps = { name: '' };
        ServiceChildModel.services = {
          test: () => ({
            modelWillUnmount() {
              spy();
            }
          })
        };

        class ServiceParentModel extends Model {}
        ServiceParentModel.defaultProps = {
          list: () => new List()
        };

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

      it('trigger service modelDidUpdate', () => {
        const spy = sinon.spy();

        class ServiceChildModel extends Model {}
        ServiceChildModel.defaultProps = { name: '' };

        ServiceChildModel.services = {
          test: () => ({
            modelDidUpdate(oldModel, newModel) {
              spy(oldModel, newModel);
            }
          })
        };

        class ServiceParentModel extends Model {}

        ServiceParentModel.defaultProps = {
          list: () => new List()
        };

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
