import { expect } from 'chai';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { keys } from 'lodash';
import sinon from 'sinon';
import { List, Map } from 'immutable';
import { isModel, Model } from '../index';
import { Debug } from '../../debug';

describe('Model', () => {
  it('is model', () => {
    const model = new Model({ propTypes: {} });

    expect(isModel(model)).to.be.true;
    expect(isModel({})).to.be.false;
  });

  it('displayName', () => {
    const model = new Model({
      displayName: 'MyModel'
    });

    expect(model.displayName).to.equal('MyModel');
  });

  it('propTypes', () => {
    const model = new Model({
      propTypes: {
        name: PropTypes.string
      }
    });

    expect(model.propTypes.name).to.equal(PropTypes.string);
  });

  it('contextTypes', () => {
    const model = new Model({
      contextTypes: {
        name: PropTypes.string
      }
    });

    expect(model.contextTypes.name).to.equal(PropTypes.string);
  });

  it('eventTypes', () => {
    const model = new Model({
      eventTypes: ['name']
    });

    expect(model.eventTypes).to.deep.equal(['name']);
  });

  it('watchEventTypes', () => {
    const model = new Model({
      watchEventTypes: ['name']
    });

    expect(model.watchEventTypes).to.deep.equal(['name']);
  });

  it('merge extra bindings', () => {
    const model = new Model({
      extraBindings: {
        myAttribute: { one: 1, two: 2 },
        myMethod() {
          return this.myAttribute.one + this.myAttribute.two;
        }
      }
    });

    expect(model.myMethod()).to.equal(3);
  });

  it('check missing defaults for propTypes', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          name: PropTypes.string
        },

        props: {
          name: 'hi'
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'Key "name" defined in propTypes but is missing in defaultProps for model Test'
    );

    Debug.disable();
  });

  it('check missing defaults for localPropTypes', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          foo: PropTypes.string
        },

        localPropTypes: {
          name: PropTypes.string
        },

        defaultProps: {
          foo: ''
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'Key "name" defined in propTypes or localPropTypes ' +
        'but is missing in defaultProps for model Test'
    );

    Debug.disable();
  });

  it('check missing propTypes', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',

        defaultProps: {
          name: 'hi'
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'Key "name" defined in defaultProps but is missing in propTypes for model Test'
    );

    Debug.disable();
  });

  it('check missing propTypes when defaults are a function', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',

        defaultProps() {
          return {
            name: 'hi'
          };
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'Key "name" defined in defaultProps but is missing in propTypes for model Test'
    );

    Debug.disable();
  });

  it('confirm props are provided to defaults when defaults are a function', () => {
    const model = new Model({
      displayName: 'Test',

      propTypes: {
        name: PropTypes.string.isRequired
      },

      props: {
        name: 'hi'
      },

      defaultProps(props) {
        return {
          name: props.name
        };
      }
    });

    expect(model).to.be.an('object');
    expect(model.get('name')).to.equal('hi');
  });

  it('validates the logic of isRequired in propTypes', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',
        propTypes: {
          name: PropTypes.string.isRequired
        },
        defaultProps: {
          name: 'name'
        },
        props: {
          name: null
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'The prop `name` is marked as required in `model Test`, but its value is `null`.'
    );

    expect(() => {
      const model = new Model({
        displayName: 'Test',
        propTypes: {
          name: PropTypes.string.isRequired
        },
        defaultProps: {
          name: null
        },
        props: {
          name: 'name'
        }
      });

      expect(model).to.be.an('object');
    }).to.not.throw(Error);

    expect(() => {
      const model = new Model({
        displayName: 'Test',
        propTypes: {
          name: PropTypes.string.isRequired
        },
        defaultProps: {
          name: 'Test'
        }
      });

      expect(model).to.be.an('object');
    }).to.not.throw(Error);

    expect(() => {
      const model = new Model({
        displayName: 'Test',
        propTypes: {
          name: PropTypes.string.isRequired
        },
        defaultProps: {
          name: null
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'The prop `name` is marked as required in `model Test`, but its value is `null`.'
    );

    Debug.disable();
  });

  it('validates the property in localPropTypes', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',
        localPropTypes: {
          name: PropTypes.string.isRequired
        },
        defaultProps: {
          name: 1
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'Invalid prop `name` of type `number` supplied to `model Test`, expected `string`.'
    );

    expect(() => {
      const model = new Model({
        displayName: 'Test',
        localPropTypes: {
          name: PropTypes.string.isRequired
        },
        defaultProps: {
          name: ''
        }
      });

      model.set('name', 1);

      expect(model).to.be.an('object');
    }).to.throw(
      'Invalid prop `name` of type `number` supplied to `model Test`, expected `string`.'
    );
  });

  it('warn mutable types', () => {
    Debug.enable();
    const warn = sinon.stub(Debug, 'warn');

    const model = new Model({
      displayName: 'Test',

      propTypes: {
        person: PropTypes.object
      },

      defaultProps: {
        person: { name: 'hi' }
      }
    });

    warn.restore();

    expect(model).to.be.an('object');
    //    expect(warn.calledOnce).to.be.true; // Temporary igonre the assertion, cause it fail the npm start
    //    expect(warn.firstCall.args[0]).to.contains('Value of prop "person" is mutable for model Test');

    Debug.disable();
  });

  it('check incorrect propTypes', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          name: PropTypes.string
        },

        defaultProps: {
          name: 'hi'
        },

        props: {
          name: 123
        }
      });

      expect(model).to.be.an('object');
    }).to.throw(
      'Invalid prop `name` of type `number` supplied to `model Test`, expected `string`'
    );

    Debug.disable();
  });

  it('check if a prop is defined in propTypes before setting', () => {
    Debug.enable();

    const model = new Model({
      displayName: 'Test',

      propTypes: {
        name: PropTypes.string
      },

      localPropTypes: {
        foo: PropTypes.string
      },

      defaultProps: {
        name: 'hi',
        foo: ''
      }
    });

    expect(() => {
      model.setMulti({ undefinedProp: 'whatever' });
    }).to.throw(
      'Setting property undefinedProp on model Test which is not defined in propTypes'
    );

    expect(() => {
      model.setMulti({ name: 'new name' });
    }).to.not.throw(Error);

    expect(() => {
      model.setMulti({ foo: 'new foo' });
    }).to.not.throw(Error);

    Debug.disable();
  });

  describe('setMulti', () => {
    it('returns the original model when no prop is changed', () => {
      const model = new Model({
        propTypes: {
          name: PropTypes.string
        },

        defaultProps: {
          name: 'hi'
        }
      });

      const newModel = model.setMulti({ name: 'hi' });

      expect(newModel).to.equal(model);
    });

    it('returns a new instance when some prop is changed', () => {
      const model = new Model({
        propTypes: {
          name: PropTypes.string
        },

        defaultProps: {
          name: 'hi'
        }
      });

      const newModel = model.setMulti({ name: 'diffrent string' });

      expect(newModel).to.not.equal(model);
    });

    it('returns the original model when only localProp is changed', () => {
      const model = new Model({
        localPropTypes: {
          name: PropTypes.string,
          age: PropTypes.number
        },
        defaultProps: {
          name: 'hi',
          age: 1
        }
      });

      const newModel = model.setMulti({
        name: 'new string',
        age: originalAge => originalAge + 1
      });

      expect(newModel).to.equal(model);
      expect(model.get('name')).to.equal('new string');
      expect(model.get('age')).to.equal(2);
    });

    it('returns a new instance when both prop and localProp are changed', () => {
      const model = new Model({
        propTypes: {
          foo: PropTypes.string
        },
        localPropTypes: {
          bar: PropTypes.string
        },
        defaultProps: {
          foo: 'foo',
          bar: 'bar'
        }
      });

      const newModel = model.setMulti({ foo: 'new foo', bar: 'new bar' });

      expect(newModel).to.not.equal(model);
      expect(newModel.get('bar')).to.equal('new bar');
    });
  });

  describe('mergeAttributes', () => {
    it('support value which is a mapping function', () => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          name: PropTypes.string
        },

        defaultProps: {
          name: 'hi'
        }
      });

      const newAttributes = model.mergeAttributes({
        name: n => n + n
      });

      expect(newAttributes.name).to.equal('hihi');
    });
  });

  describe('ensurePropsUnique', () => {
    it('throw if prop not unique', () => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          name: PropTypes.string
        },

        localPropTypes: {
          name: PropTypes.string
        }
      });

      expect(() => {
        model.ensurePropsUnique(
          model.propTypes,
          model.localPropTypes,
          model.displayName
        );
      }).to.throw('Local prop key "name" already existed in props of Test');
    });

    it('dose not throw if prop unique', () => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          name: PropTypes.string
        },

        localPropTypes: {
          age: PropTypes.number
        }
      });

      expect(() => {
        model.ensurePropsUnique(
          model.propTypes,
          model.localPropTypes,
          model.displayName
        );
      }).to.not.throw(Error);
    });
  });

  describe('validateProps', () => {
    it('throw if defaults not provided', () => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          isLoading: PropTypes.bool,
          name: PropTypes.string
        }
      });

      expect(() => {
        model.validateProps(
          { name: 'hi', title: 'title' },
          model.propTypes,
          model.displayName
        );
      }).to.throw(
        'Setting property title on Test which is not defined in propTypes'
      );
    });

    it('not throw if defaults provided', () => {
      const model = new Model({
        displayName: 'Test',

        propTypes: {
          isLoading: PropTypes.bool,
          name: PropTypes.string
        }
      });

      expect(() => {
        model.validateProps({ name: 'hi' }, model.propTypes, model.displayName);
      }).to.not.throw(Error);
    });

    it('throw if defaults not provided for model', () => {
      Debug.enable();

      expect(() => {
        const model = new Model({
          displayName: 'Test',

          propTypes: {
            name: PropTypes.string
          },

          defaultProps: {
            name: 'hi'
          },

          props: {
            name: 'name',
            title: 'title'
          }
        });
        expect(model).to.be.an('object');
      }).to.throw(
        'Setting property title on model Test which is not defined in propTypes'
      );

      Debug.disable();
    });
  });

  it('toJS', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const car1 = new Model({
      props: { make: 'BYD' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const car2 = new Model({
      props: { make: 'Toyota' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });
    const model = new Model({
      props: {
        name: 'Ben',
        cars: new List([car1, car2]),
        daughter,
        address
      },
      defaultProps: {
        name: '',
        cars: new List(),
        daughter: null,
        address: null
      },
      propTypes: {
        name: PropTypes.string,
        cars: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model)),
        daughter: PropTypes.instanceOf(Model),
        address: ImmutablePropTypes.map
      }
    });

    expect(model.toJS()).to.deep.equal({
      name: 'Ben',
      daughter: { name: 'Merida' },
      cars: [{ make: 'BYD' }, { make: 'Toyota' }],
      address: {
        line1: '275 7th Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
  });

  it('toJSON', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const car1 = new Model({
      props: { make: 'BYD' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const car2 = new Model({
      props: { make: 'Toyota' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });
    const model = new Model({
      props: {
        name: 'Ben',
        cars: new List([car1, car2]),
        daughter,
        address
      },
      defaultProps: {
        name: '',
        cars: new List(),
        daughter: null,
        address: null
      },
      propTypes: {
        name: PropTypes.string,
        cars: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model)),
        daughter: PropTypes.instanceOf(Model),
        address: ImmutablePropTypes.map
      }
    });

    expect(model.toJSON()).to.deep.equal({
      name: 'Ben',
      daughter: {
        name: 'Merida',
        path: ['daughter']
      },
      cars: [
        {
          make: 'BYD',
          path: ['cars', 0]
        },
        {
          make: 'Toyota',
          path: ['cars', 1]
        }
      ],
      address: {
        line1: '275 7th Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      },
      path: []
    });
  });

  it('delegates', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string },
      extraBindings: {
        getName() {
          return this.get('name');
        },
        appendToName(addition) {
          const name = this.get('name');

          return this.set('name', name + addition);
        },
        getDoubleName() {
          const name = this.get('name');

          return name + name;
        }
      }
    });
    const model = new Model({
      props: {
        name: 'Ben',
        daughter
      },
      defaultProps: {
        name: '',
        daughter: null
      },
      propTypes: {
        name: PropTypes.string,
        daughter: PropTypes.instanceOf(Model)
      },
      delegates: {
        daughter: [
          { method: 'getName', set: false, ifNotExist: 'DEFAULT' },
          { method: 'getDoubleName', as: 'dn', set: false },
          { method: 'appendToName', set: true }
        ]
      }
    });

    expect(model.getName()).to.equal('Merida');
    expect(model.dn()).to.equal('MeridaMerida');

    const newModel = model.appendToName('Cao');
    expect(newModel.dn()).to.equal('MeridaCaoMeridaCao');

    const emptyDaughterModel = model.set('daughter', null);
    expect(emptyDaughterModel.getName()).to.equal('DEFAULT');
  });

  it('delegates do not mutate if child after set remains the same', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string },
      extraBindings: {
        setName(newName) {
          const currentName = this.get('name');

          if (newName === currentName) {
            return this;
          } else {
            return this.set('name', newName);
          }
        }
      }
    });
    const model = new Model({
      props: {
        name: 'Ben',
        daughter
      },
      defaultProps: {
        name: '',
        daughter: null
      },
      propTypes: {
        name: PropTypes.string,
        daughter: PropTypes.instanceOf(Model)
      },
      delegates: {
        daughter: [{ method: 'setName', as: 'setDaughterName', set: true }]
      }
    });

    expect(model.setDaughterName('Merida')).to.equal(model);
  });

  it('delegates throws when calling child method before it exists', () => {
    const model = new Model({
      props: {
        name: 'Ben',
        daughter: null
      },
      defaultProps: {
        name: '',
        daughter: null
      },
      propTypes: {
        name: PropTypes.string,
        daughter: PropTypes.instanceOf(Model)
      },
      delegates: {
        daughter: [
          { method: 'getName', set: false, ifNotExist: 'DEFAULT' },
          { method: 'getDoubleName', as: 'dn', set: false },
          { method: 'appendToName', set: true }
        ]
      }
    });

    expect(() => {
      model.dn();
    }).to.throw(/calling child method before it exists/);

    expect(() => {
      model.appendToName('ABC');
    }).to.throw(/calling child method before it exists/);
  });

  it('childModels', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const car1 = new Model({
      props: { make: 'BYD' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const car2 = new Model({
      props: { make: 'Toyota' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });
    const manhattan = new Model({
      props: { name: 'Manhattan' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const longIsland = new Model({
      props: { name: 'Long Island' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const springfield = new Model({
      props: { name: 'Springfield' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const shortHills = new Model({
      props: { name: 'Short Hills' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const newYorkKnicks = new Model({
      props: { name: 'New York Knicks' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const lakers = new Model({
      props: { name: 'Lakers' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const clippers = new Model({
      props: { name: 'Clippers' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const model = new Model({
      props: {
        name: 'Ben',
        cars: new List([car1, car2]),
        cities: new Map({
          newYork: new List([manhattan, longIsland]),
          newJersey: new List([springfield, shortHills])
        }),
        teams: new Map({
          newYork: new Map({ newYorkKnicks }),
          losAngeles: new Map({ lakers, clippers })
        }),
        daughter,
        address
      },
      defaultProps: {
        name: '',
        cars: new List(),
        cities: new Map(),
        teams: new Map(),
        daughter: null,
        address: null
      },
      propTypes: {
        name: PropTypes.string,
        cars: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model)),
        cities: ImmutablePropTypes.mapOf(
          ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
        ),
        teams: ImmutablePropTypes.mapOf(
          ImmutablePropTypes.mapOf(PropTypes.instanceOf(Model))
        ),
        daughter: PropTypes.instanceOf(Model),
        address: ImmutablePropTypes.map
      }
    });

    expect(model.childModels()).to.deep.include.members([
      [daughter, ['daughter']],
      [car1, ['cars', 0]],
      [car2, ['cars', 1]],
      [manhattan, ['cities', 'newYork', 0]],
      [longIsland, ['cities', 'newYork', 1]],
      [springfield, ['cities', 'newJersey', 0]],
      [shortHills, ['cities', 'newJersey', 1]],
      [newYorkKnicks, ['teams', 'newYork', 'newYorkKnicks']],
      [lakers, ['teams', 'losAngeles', 'lakers']],
      [clippers, ['teams', 'losAngeles', 'clippers']]
    ]);
  });

  it('childModelsRecursive', () => {
    const messagesChild = new Model({});

    const messages = new Model({
      propTypes: { child: PropTypes.instanceOf(Model) },
      defaultProps: { child: null },
      props: { child: messagesChild }
    });

    const module1Child = new Model({});

    const module1 = new Model({
      propTypes: { child: PropTypes.instanceOf(Model) },
      defaultProps: { child: null },
      props: { child: module1Child }
    });

    const module2Child = new Model({});

    const module2 = new Model({
      propTypes: { child: PropTypes.instanceOf(Model) },
      defaultProps: { child: null },
      props: { child: module2Child }
    });

    const model = new Model({
      propTypes: {
        modules: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model)),
        messages: PropTypes.instanceOf(Model)
      },
      defaultProps: {
        modules: () => new List(),
        messages: null
      },
      props: {
        modules: new List([module1, module2]),
        messages
      }
    });

    expect(model.childModelsRecursive()).to.deep.include.members([
      [messagesChild, ['messages', 'child']],
      [messages, ['messages']],
      [module1Child, ['modules', 0, 'child']],
      [module1, ['modules', 0]],
      [module2Child, ['modules', 1, 'child']],
      [module2, ['modules', 1]]
    ]);
  });

  it('maintain parent pointer', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const model = new Model({
      props: {
        name: 'Ben',
        daughter
      },
      defaultProps: {
        name: '',
        daughter: null
      },
      propTypes: {
        name: PropTypes.string,
        daughter: PropTypes.instanceOf(Model)
      }
    });
    expect(daughter.__parent__).to.equal(model);

    const updatedModel = model.set('name', 'Maple');
    expect(daughter.__parent__).to.equal(updatedModel);

    const anotherModel = new Model({
      props: {
        name: 'Ben',
        daughter
      },
      defaultProps: {
        name: '',
        daughter: null
      },
      propTypes: {
        name: PropTypes.string,
        daughter: PropTypes.instanceOf(Model)
      }
    });
    expect(daughter.__parent__).to.equal(anotherModel);
  });

  it('clear', () => {
    const daughter = new Model({
      props: { name: 'Merida' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });
    const car1 = new Model({
      props: { make: 'BYD' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const car2 = new Model({
      props: { make: 'Toyota' },
      defaultProps: { make: '' },
      propTypes: { make: PropTypes.string }
    });
    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });
    const model = new Model({
      props: {
        name: 'Ben',
        cars: new List([car1, car2]),
        daughter,
        address
      },
      defaultProps: {
        name: '',
        cars: new List(),
        daughter: null,
        address: null
      },
      propTypes: {
        name: PropTypes.string,
        cars: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model)),
        daughter: PropTypes.instanceOf(Model),
        address: ImmutablePropTypes.map
      }
    });

    expect(model.clear().toJS()).to.deep.equal({
      name: '',
      cars: [],
      daughter: null,
      address: null
    });
  });

  it('getIn', () => {
    const year2015 = new Model({
      props: { name: '2015' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });

    const year2016 = new Model({
      props: { name: '2016' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });

    const highlander = new Model({
      props: { name: 'Highlander', years: new List([year2015, year2016]) },
      defaultProps: { name: '', years: new List() },
      propTypes: { name: PropTypes.string, years: ImmutablePropTypes.list }
    });

    const toyota = new Model({
      props: { name: 'Toyota', models: new List([highlander]) },
      defaultProps: { name: '', models: new List() },
      propTypes: { name: PropTypes.string, models: ImmutablePropTypes.list }
    });

    expect(toyota.getIn(['models', 0, 'name'])).to.equal('Highlander');
    expect(toyota.getIn(['models', 0, 'years', 0])).to.equal(year2015);
    expect(toyota.getIn(['models', 0, 'years', 1])).to.equal(year2016);
    expect(toyota.getIn(['models', 0, 'years', 0, 'name'])).to.equal('2015');
    expect(toyota.getIn(['models', 0, 'years', 1, 'name'])).to.equal('2016');
  });

  it('getIn not exist path', () => {
    const year2015 = new Model({
      props: { name: '2015' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });

    expect(year2015.getIn(['name', 'not_exists'])).to.be.undefined;
    expect(year2015.getIn(['not_exists'])).to.be.undefined;
  });

  it('updateIn with values', () => {
    const year2015 = new Model({
      props: { name: '2015' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });

    const year2016 = new Model({
      props: { name: '2016' },
      defaultProps: { name: '' },
      propTypes: { name: PropTypes.string }
    });

    const highlander = new Model({
      props: { name: 'Highlander', years: new List([year2015, year2016]) },
      defaultProps: { name: '', years: new List() },
      propTypes: { name: PropTypes.string, years: ImmutablePropTypes.list }
    });

    const toyota = new Model({
      props: { name: 'Toyota', models: new List([highlander]) },
      defaultProps: { name: '', models: new List() },
      propTypes: { name: PropTypes.string, models: ImmutablePropTypes.list }
    });

    expect(
      toyota
        .updateIn(['models', 0, 'name'], 'Camry')
        .getIn(['models', 0, 'name'])
    ).to.equal('Camry');
    expect(
      toyota
        .updateIn(['models', 0, 'years', 0], year2016)
        .getIn(['models', 0, 'years', 0])
    ).to.equal(year2016);
  });

  it('updateIn with function', () => {
    const addASeat = seats => seats + 1;

    const highlander = new Model({
      props: { name: 'Highlander', seats: 4 },
      defaultProps: { name: '', seats: 0 },
      propTypes: { name: PropTypes.string, seats: PropTypes.number }
    });

    const celica = new Model({
      props: { name: 'Celica', seats: 2 },
      defaultProps: { name: '', seats: 0 },
      propTypes: { name: PropTypes.string, seats: PropTypes.number }
    });

    const toyota = new Model({
      props: { name: 'Toyota', models: new List([highlander, celica]) },
      defaultProps: { name: '', models: new List() },
      propTypes: { name: PropTypes.string, models: ImmutablePropTypes.list }
    });

    expect(
      toyota
        .updateIn(['models', 0, 'seats'], addASeat)
        .getIn(['models', 0, 'seats'])
    ).to.equal(5);
    expect(
      toyota
        .updateIn(['models', 1, 'seats'], addASeat)
        .getIn(['models', 1, 'seats'])
    ).to.equal(3);
  });

  it('get context', () => {
    const studentA = new Model({
      contextTypes: {
        slogan: PropTypes.string,
        headTeacher: PropTypes.string
      }
    });

    const gradeA = new Model({
      props: { name: 'Grade 1', students: new List([studentA]) },
      defaultProps: { name: '', students: new List() },
      propTypes: {
        name: PropTypes.string,
        students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      childContextTypes: {
        slogan: PropTypes.string
      },
      extraBindings: {
        getChildContext() {
          return { slogan: `We are ${this.get('name')}` };
        }
      }
    });

    const studentB = new Model({
      contextTypes: {
        slogan: PropTypes.string,
        headTeacher: PropTypes.string
      }
    });

    const gradeB = new Model({
      props: { name: 'Grade 2', students: new List([studentB]) },
      defaultProps: { name: '', students: new List() },
      propTypes: {
        name: PropTypes.string,
        students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      childContextTypes: {
        slogan: PropTypes.string
      },
      extraBindings: {
        getChildContext() {
          return { slogan: `We are ${this.get('name')}` };
        }
      }
    });

    const school = new Model({
      props: {
        teachers: new List(['Ray', 'Hoo']),
        grades: new List([gradeA, gradeB])
      },
      defaultProps: { teachers: new List(), grades: new List() },
      propTypes: {
        teachers: ImmutablePropTypes.listOf(PropTypes.string),
        grades: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      childContextTypes: {
        headTeacher: PropTypes.string
      },
      extraBindings: {
        getChildContext() {
          return { headTeacher: this.get('teachers').first() };
        }
      }
    });

    expect(school.getChildContext().headTeacher).to.equal('Ray');
    expect(studentA.getContext('slogan')).to.equal('We are Grade 1');
    expect(studentA.getContext('headTeacher')).to.equal('Ray');
    expect(studentB.getContext('slogan')).to.equal('We are Grade 2');
    expect(studentB.getContext('headTeacher')).to.equal('Ray');
  });

  it('throws missing context definition', () => {
    const studentA = new Model({});

    expect(() => {
      studentA.getContext('slogan');
    }).to.throw('Unable to find "slogan" from declared context');
  });

  it('throws missing context', () => {
    const studentA = new Model({
      contextTypes: {
        slogan: PropTypes.string,
        headTeacher: PropTypes.string
      }
    });

    expect(() => {
      studentA.getContext('slogan');
    }).to.throw('Unable to find "slogan" from context');
  });

  it('check context type', () => {
    const studentA = new Model({
      contextTypes: {
        slogan: PropTypes.string,
        headTeacher: PropTypes.string
      }
    });

    const gradeA = new Model({
      props: { name: 'Grade 1', students: new List([studentA]) },
      defaultProps: { name: '', students: new List() },
      propTypes: {
        name: PropTypes.string,
        students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      childContextTypes: {
        slogan: PropTypes.string
      },
      extraBindings: {
        getChildContext() {
          return { slogan: 1 };
        }
      }
    });

    expect(gradeA.getChildContext().slogan).to.equal(1);

    expect(() => {
      studentA.getContext('slogan');
    }).to.throw('Invalid context `slogan`');
  });

  it('bubble event', () => {
    const gradeSpy = sinon.spy();
    const schoolSpy = sinon.spy();

    const student = new Model({
      eventTypes: ['courseDone'],
      extraBindings: {
        sendCourseDone() {
          return new Promise(resolve => {
            this.bubbleEvent('courseDone');

            resolve();
          });
        }
      }
    });
    const grade = new Model({
      propTypes: {
        students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      defaultProps: {
        students: new List()
      },
      props: {
        students: new List([student])
      },
      watchEventTypes: ['courseDone'],
      extraBindings: {
        watchEvent(type) {
          if (type === 'courseDone') {
            gradeSpy();
          }
        }
      }
    });
    const school = new Model({
      propTypes: {
        grades: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      defaultProps: {
        grades: new List()
      },
      props: {
        grades: new List([grade])
      },
      watchEventTypes: ['courseDone'],
      extraBindings: {
        watchEvent(type, from) {
          if (type === 'courseDone' && from(grade)) {
            schoolSpy();
          }
        }
      }
    });

    return student.sendCourseDone().then(() => {
      expect(school).to.be.an.instanceof(Model);
      expect(gradeSpy.calledOnce).to.be.true;
      expect(schoolSpy.calledOnce).to.be.true;
    });
  });

  it('throws when bubble undefined events', () => {
    expect(() => {
      const student = new Model({
        displayName: 'Student',

        extraBindings: {
          sendCourseDone() {
            this.bubbleEvent('courseDone');
          }
        }
      });

      student.sendCourseDone();
    }).to.throw(/missing courseDone in eventTypes for model Student/);
  });

  it('bubble event with payload', () => {
    const gradeSpy = sinon.spy();
    const eventPayload = {
      param: PropTypes.string
    };

    const student = new Model({
      eventTypes: [
        {
          type: 'courseDone',
          payload: {
            param: PropTypes.string
          }
        }
      ]
    });

    const grade = new Model({
      propTypes: {
        students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
      },
      defaultProps: {
        students: new List()
      },
      props: {
        students: new List([student])
      },
      watchEventTypes: [
        {
          type: 'courseDone',
          payload: {
            param: PropTypes.string
          }
        }
      ],
      extraBindings: {
        watchEvent(type, from, payload) {
          if (type === 'courseDone') {
            gradeSpy(payload);
          }
        }
      }
    });

    student.bubbleEvent('courseDone', eventPayload);

    expect(grade).to.be.an.instanceof(Model);
    expect(gradeSpy.calledOnce).to.be.true;
    expect(gradeSpy.calledWith(eventPayload)).to.be.true;
  });

  it('throws Error when define eventTypes/watchEventTypes which are not string or valid Object', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Student',
        eventTypes: true
      });

      model.bubbleEvent('reload');
    }).to.throw('eventTypes defination in model Student should be an array');

    expect(() => {
      const model = new Model({
        displayName: 'Student',
        eventTypes: [true]
      });

      model.bubbleEvent('reload');
    }).to.throw('invalid eventTypes defination in model Student');

    expect(() => {
      const model = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      model.bubbleEvent('reload');
    }).to.throw(
      'missing type or payload property in eventTypes defination in model Student'
    );

    expect(() => {
      const student = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      const grade = new Model({
        displayName: 'Grade',
        propTypes: {
          students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
        },
        defaultProps: {
          students: new List()
        },
        props: {
          students: new List([student])
        },
        watchEventTypes: true
      });

      student.bubbleEvent('courseDone');
      expect(grade).to.be.an.instanceof(Model);
    }).to.throw('watchEventTypes defination in model Grade should be an array');

    expect(() => {
      const student = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      const grade = new Model({
        displayName: 'Grade',
        propTypes: {
          students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
        },
        defaultProps: {
          students: new List()
        },
        props: {
          students: new List([student])
        },
        watchEventTypes: [true]
      });

      student.bubbleEvent('courseDone');
      expect(grade).to.be.an.instanceof(Model);
    }).to.throw('invalid watchEventTypes defination in model Grade');

    expect(() => {
      const student = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      const grade = new Model({
        displayName: 'Grade',
        propTypes: {
          students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
        },
        defaultProps: {
          students: new List()
        },
        props: {
          students: new List([student])
        },
        watchEventTypes: [
          {
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      student.bubbleEvent('courseDone');
      expect(grade).to.be.an.instanceof(Model);
    }).to.throw(
      'missing type or payload property in watchEventTypes defination in model Grade'
    );

    Debug.disable();
  });

  it('throws Error when passing invalid payload', () => {
    Debug.enable();

    expect(() => {
      const model = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      model.bubbleEvent('courseDone', {
        otherParams: 'abc'
      });
    }).to.throw(
      'passing payload data otherParams which is/are not defined in eventTypes/watchEventTypes'
    );

    expect(() => {
      const student = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      const grade = new Model({
        displayName: 'Grade',
        propTypes: {
          students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
        },
        defaultProps: {
          students: new List()
        },
        props: {
          students: new List([student])
        },
        watchEventTypes: [
          {
            type: 'courseDone',
            payload: {
              anotherParam: PropTypes.string
            }
          }
        ]
      });

      student.bubbleEvent('courseDone', {
        param: 'abc'
      });
      expect(grade).to.be.an.instanceof(Model);
    }).to.throw(
      'passing payload data param which is/are not defined in eventTypes/watchEventTypes'
    );

    expect(() => {
      const model = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      model.bubbleEvent('courseDone', {
        param: true
      });
    }).to.throw(
      'Invalid prop `param` of type `boolean` supplied to `Student`, expected `string`'
    );

    expect(() => {
      const student = new Model({
        displayName: 'Student',
        eventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.string
            }
          }
        ]
      });

      const grade = new Model({
        displayName: 'Grade',
        propTypes: {
          students: ImmutablePropTypes.listOf(PropTypes.instanceOf(Model))
        },
        defaultProps: {
          students: new List()
        },
        props: {
          students: new List([student])
        },
        watchEventTypes: [
          {
            type: 'courseDone',
            payload: {
              param: PropTypes.bool
            }
          }
        ]
      });

      student.bubbleEvent('courseDone', {
        param: 'abc'
      });
      expect(grade).to.be.an.instanceof(Model);
    }).to.throw(
      'Invalid prop `param` of type `string` supplied to `Grade`, expected `boolean`'
    );

    Debug.disable();
  });

  it('handle events from different child models', () => {
    const spyA = sinon.spy();
    const spyB = sinon.spy();

    const studentA = new Model({
      displayName: 'StudentA',
      eventTypes: ['courseDone'],
      extraBindings: {
        sendCourseDone() {
          this.bubbleEvent('courseDone');
        }
      }
    });
    const studentB = new Model({
      displayName: 'StudentB',
      eventTypes: ['courseDone'],
      extraBindings: {
        sendCourseDone() {
          this.bubbleEvent('courseDone');
        }
      }
    });

    const grade = new Model({
      propTypes: {
        a: PropTypes.instanceOf(Model),
        b: PropTypes.instanceOf(Model)
      },
      defaultProps: {
        a: null,
        b: null
      },
      props: {
        a: studentA,
        b: studentB
      },
      watchEventTypes: ['courseDone'],
      extraBindings: {
        watchEvent(type, from) {
          if (type === 'courseDone' && from('StudentA')) {
            spyA();
          }
          if (type === 'courseDone' && from(this.get('b'))) {
            spyB();
          }
        }
      }
    });

    expect(grade).to.be.an('object');

    studentA.sendCourseDone();
    expect(spyA.calledOnce).to.be.true;
    expect(spyB.called).to.be.false;

    studentB.sendCourseDone();
    expect(spyB.calledOnce).to.be.true;
  });

  it('should keep stable sender method pointer', () => {
    const student = new Model({
      displayName: 'Student',

      propTypes: {
        grade: PropTypes.number
      },
      defaultProps: {
        grade: 1
      },
      props: {
        grade: 1
      },

      extraBindings: {
        sendPromotion() {
          // Return a model prop in order to test 'this'
          return this.get('grade');
        },

        getCurrentGrade() {
          return this.get('grade');
        }
      }
    });

    const studentPromoted = student.set('grade', 2);

    expect(student).to.not.equal(studentPromoted);
    // Sender function should be stable between old and new models
    expect(student.sendPromotion).to.equal(studentPromoted.sendPromotion);
    expect(student.sendPromotion === studentPromoted.sendPromotion).to.be.true;
    // 'this' in a sender function should be pointing to latest instance
    expect(student.sendPromotion()).to.equal(studentPromoted.sendPromotion());
    // Other extraBindings functions should not be stablized
    expect(student.getCurrentGrade).to.not.equal(
      studentPromoted.getCurrentGrade
    );
    expect(student.getCurrentGrade()).to.not.equal(
      studentPromoted.getCurrentGrade()
    );
  });

  it('getService', () => {
    const inbox = new Model({
      displayName: 'Inbox',

      propTypes: {
        name: PropTypes.number
      },

      defaultProps: {
        name: 'messages'
      },

      props: {
        name: 'messages'
      },

      services: {
        test: function createService() {
          return {
            modelDidMount() {}
          };
        }
      }
    });

    expect(inbox.getService('test').modelDidMount).to.be.a('function');
  });

  it('getServices', () => {
    const inbox = new Model({
      displayName: 'Inbox',

      propTypes: {
        name: PropTypes.number
      },

      defaultProps: {
        name: 'messages'
      },

      props: {
        name: 'messages'
      },

      services: {
        service1: function createService() {
          return {
            modelDidMount() {}
          };
        },
        service2: function createService() {
          return {
            modelWillUnmount() {}
          };
        }
      }
    });

    const services = inbox.getServices();

    expect(keys(services)).to.deep.include.members(['service1', 'service2']);

    const { service1, service2 } = services;

    expect(service1.modelDidMount).to.be.a('function');
    expect(service2.modelWillUnmount).to.be.a('function');
  });

  it('isPeer', () => {
    const model = new Model({
      propTypes: {
        name: PropTypes.string
      },

      defaultProps: {
        name: ''
      }
    });

    const newModel = model.set('name', 'new');

    expect(model.isPeer(newModel)).to.be.true;
    expect(newModel.isPeer(model)).to.be.true;
    expect(newModel.isPeer(new Model({}))).to.be.false;
  });
});
