import { expect } from 'chai';
import { List, Map } from 'immutable';
import { keys } from 'ramda';
import PropTypes from 'proptypes';
import sinon from 'sinon';
import Model from '../model';
import { isModel } from '../model_concerns/is_model';
import { ensureParentPointerOnChildModels } from '../model_concerns/parent_pointer';

describe('Model', () => {
  it('is model', () => {
    const model = new Model();

    expect(isModel(model)).to.be.true;
    expect(isModel({})).to.be.false;
  });

  it('default displayName', () => {
    class Test extends Model {}

    expect(new Test().displayName).to.equal('Test');
  });

  it('custom displayName', () => {
    class Test extends Model {}

    Test.displayName = 'LamoModel';

    expect(new Test().displayName).to.equal('LamoModel');
  });

  it('merge bindings', () => {
    class Test extends Model {
      constructor(props) {
        super(props);

        this.myAttribute = { one: 1, two: 2 };
      }

      myMethod() {
        return this.myAttribute.one + this.myAttribute.two;
      }
    }

    expect(new Test().myMethod()).to.equal(3);
  });

  it('freeze props', () => {
    class Test extends Model {}

    Test.propTypes = {
      age: PropTypes.number
    };

    Test.defaultProps = {
      age: 1
    };

    expect(() => {
      const t = new Test();
      const attrs = t.props();

      attrs.age = 2;
    }).to.throw;
  });

  it('check missing defaults for propTypes', () => {
    expect(() => {
      class Test extends Model {}

      Test.propTypes = {
        name: PropTypes.string,
        age: PropTypes.number
      };

      Test.defaultProps = {
        age: 1
      };

      expect(new Test({ name: 'hi' })).to.be.an('object');
    }).to.throw(
      'Key "name" defined in propTypes but is missing in defaultProps for model Test'
    );
  });

  it('check missing propTypes', () => {
    expect(() => {
      class Test extends Model {}

      Test.propTypes = {
        hi: PropTypes.string
      };

      Test.defaultProps = {
        name: '222',
        hi: '123'
      };

      expect(new Test()).to.be.an('object');
    }).to.throw(
      'Key "name" defined in defaultProps but is missing in propTypes for model Test'
    );
  });

  it('validates the logic of isRequired in propTypes', () => {
    expect(() => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'name'
      };
      Test.propTypes = {
        name: PropTypes.string.isRequired
      };

      const model = new Test({ name: null });

      expect(model).to.be.an('object');
    }).to.throw('Required prop `name` was not specified in `model Test`');

    expect(() => {
      class Test extends Model {}

      Test.defaultProps = {
        name: null
      };
      Test.propTypes = {
        name: PropTypes.string.isRequired
      };

      const model = new Test({ name: 'name' });

      expect(model).to.be.an('object');
    }).to.not.throw(Error);

    expect(() => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'Test'
      };
      Test.propTypes = {
        name: PropTypes.string.isRequired
      };

      const model = new Test();

      expect(model).to.be.an('object');
    }).to.not.throw(Error);

    expect(() => {
      class Test extends Model {}

      Test.defaultProps = {
        name: null
      };
      Test.propTypes = {
        name: PropTypes.string.isRequired
      };

      const model = new Test();

      expect(model).to.be.an('object');
    }).to.throw('Required prop `name` was not specified in `model Test`');
  });

  it('check incorrect propTypes', () => {
    expect(() => {
      class Test extends Model {}

      Test.defaultProps = { name: '' };
      Test.propTypes = {
        name: PropTypes.string
      };

      const model = new Test({ name: 123 });

      expect(model).to.be.an('object');
    }).to.throw(
      'Invalid prop `name` of type `number` supplied to `model Test`, expected `string`'
    );
  });

  it('check if a prop is defined in propTypes before setting', () => {
    class Test extends Model {}

    Test.defaultProps = { name: 'hi' };

    const model = new Test();

    expect(() => {
      model.setMulti({ undefinedProp: 'whatever' });
    }).to.throw(
      'Setting property undefinedProp on model Test which is not defined in defaultProps'
    );

    expect(() => {
      model.setMulti({ name: 'new name' });
    }).to.not.throw(Error);
  });

  describe('setMulti', () => {
    it('returns the original model when no prop is changed', () => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'hi'
      };

      const model = new Test();

      const newModel = model.setMulti({ name: 'hi' });

      expect(newModel).to.equal(model);
    });

    it('returns a new instance when some prop is changed', () => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'hi'
      };

      const model = new Test();

      const newModel = model.setMulti({ name: 'diffrent string' });

      expect(newModel).to.not.equal(model);
    });
  });

  describe('setMulti', () => {
    it('support value which is a primitive type', () => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'hi'
      };

      const model = new Test();

      const newModel = model.setMulti({
        name: 'gogo'
      });

      expect(newModel.get('name')).to.equal('gogo');
    });

    it('support value which is a mapping function', () => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'hi'
      };

      const model = new Test();

      const newModel = model.setMulti({
        name: n => n + n
      });

      expect(newModel.get('name')).to.equal('hihi');
    });

    it('support changing multiple values', () => {
      class Test extends Model {}

      Test.defaultProps = {
        name: 'hi',
        age: 12
      };

      const model = new Test();

      const newModel = model.setMulti({
        name: 'gogo',
        age: 14
      });

      expect(newModel.get('name')).to.equal('gogo');
      expect(newModel.get('age')).to.equal(14);
    });
  });

  it('toJS', () => {
    class Person extends Model {}
    Person.defaultProps = { name: '' };

    const daughter = new Person({ name: 'Merida' });

    class Car extends Model {}
    Car.defaultProps = { make: '' };

    const car1 = new Car({ make: 'BYD' });
    const car2 = new Car({ make: 'Toyota' });

    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });

    class Test extends Model {}
    Test.defaultProps = {
      name: '',
      cars: new List(),
      daughter: null,
      address: null
    };

    const model = new Test({
      name: 'Ben',
      cars: new List([car1, car2]),
      daughter,
      address
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
    class Person extends Model {}
    Person.defaultProps = { name: '' };

    const daughter = new Person({ name: 'Merida' });

    class Car extends Model {}
    Car.defaultProps = { make: '' };

    const car1 = new Car({ make: 'BYD' });
    const car2 = new Car({ make: 'Toyota' });

    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });

    class Test extends Model {}
    Test.defaultProps = {
      name: '',
      cars: new List(),
      daughter: null,
      address: null
    };

    const model = new Test({
      name: 'Ben',
      cars: new List([car1, car2]),
      daughter,
      address
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
    class Person extends Model {
      getName() {
        return this.get('name');
      }

      appendToName(addition) {
        const name = this.get('name');

        return this.set('name', name + addition);
      }

      getDoubleName() {
        const name = this.get('name');

        return name + name;
      }
    }

    Person.defaultProps = {
      name: ''
    };

    class Test extends Model {}

    Test.defaultProps = {
      name: '',
      daughter: null
    };
    Test.delegates = {
      daughter: [
        { method: 'getName', set: false, ifNotExist: 'DEFAULT' },
        { method: 'getDoubleName', as: 'dn', set: false },
        { method: 'appendToName', set: true }
      ]
    };

    const daughter = new Person({ name: 'Merida' });
    const model = new Test({ name: 'Ben', daughter });

    expect(model.getName()).to.equal('Merida');
    expect(model.dn()).to.equal('MeridaMerida');

    const newModel = model.appendToName('Cao');
    expect(newModel.dn()).to.equal('MeridaCaoMeridaCao');

    const emptyDaughterModel = model.set('daughter', null);
    expect(emptyDaughterModel.getName()).to.equal('DEFAULT');
  });

  it('delegates do not mutate if child after set remains the same', () => {
    class Person extends Model {
      setName(newName) {
        const currentName = this.get('name');

        if (newName === currentName) {
          return this;
        } else {
          return this.set('name', newName);
        }
      }
    }

    Person.defaultProps = {
      name: ''
    };

    class Test extends Model {}

    Test.defaultProps = {
      name: '',
      daughter: null
    };

    Test.delegates = {
      daughter: [{ method: 'setName', as: 'setDaughterName', set: true }]
    };

    const daughter = new Person({ name: 'Merida' });
    const model = new Test({ name: 'Ben', daughter });

    expect(model.setDaughterName('Merida')).to.equal(model);
  });

  it('delegates throws when calling child method before it exists', () => {
    class Test extends Model {}

    Test.defaultProps = {
      name: '',
      daughter: null
    };
    Test.delegates = {
      daughter: [
        { method: 'getName', set: false, ifNotExist: 'DEFAULT' },
        { method: 'getDoubleName', as: 'dn', set: false },
        { method: 'appendToName', set: true }
      ]
    };

    const model = new Test({
      name: 'Ben',
      daughter: null
    });

    expect(() => {
      model.dn();
    }).to.throw(/calling child method before it exists/);

    expect(() => {
      model.appendToName('ABC');
    }).to.throw(/calling child method before it exists/);
  });

  it('childModels', () => {
    class Person extends Model {}

    Person.defaultProps = {
      name: ''
    };

    const daughter = new Person({ name: 'Merida' });

    class Car extends Model {}

    Car.defaultProps = { make: '' };

    const car1 = new Car({ make: 'BYD' });
    const car2 = new Car({ make: 'Toyota' });

    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });

    class Place extends Model {}

    Place.defaultProps = {
      name: ''
    };

    const manhattan = new Place({ name: 'Manhattan' });
    const longIsland = new Place({ name: 'Long Island' });
    const springfield = new Place({ name: 'Springfield' });
    const shortHills = new Place({ name: 'Short Hills' });

    class Team extends Model {}

    Team.defaultProps = {
      name: ''
    };

    const newYorkKnicks = new Team({ name: 'New York Knicks' });
    const lakers = new Team({ name: 'Lakers' });
    const clippers = new Team({ name: 'Clippers' });

    class Computer extends Model {}

    Computer.defaultProps = {
      name: ''
    };

    const macPro = new Computer({ name: 'Mac Pro' });
    const macAir = new Computer({ name: 'Mac Air' });

    class Test extends Model {}

    Test.defaultProps = {
      name: '',
      cars: new List(),
      cities: new Map(),
      teams: {},
      computers: [],
      daughter: null,
      address: null
    };

    const model = new Test({
      name: 'Ben',
      cars: new List([car1, car2]),
      cities: new Map({
        newYork: new List([manhattan, longIsland]),
        newJersey: new List([springfield, shortHills])
      }),
      teams: {
        newYork: { newYorkKnicks },
        losAngeles: { lakers, clippers }
      },
      computers: [macPro, macAir],
      daughter,
      address
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
      [macPro, ['computers', 0]],
      [macAir, ['computers', 1]],
      [lakers, ['teams', 'losAngeles', 'lakers']],
      [clippers, ['teams', 'losAngeles', 'clippers']]
    ]);
  });

  it('childModelsRecursive', () => {
    class MessagesChild extends Model {}

    class Messages extends Model {}

    Messages.defaultProps = {
      child: null
    };

    class ModuleChild extends Model {}

    class Module extends Model {}

    Module.defaultProps = {
      child: null
    };

    const messagesChild = new MessagesChild();
    const messages = new Messages({ child: messagesChild });

    const module1Child = new ModuleChild();

    const module2Child = new ModuleChild();

    const module1 = new Module({ child: module1Child });
    const module2 = new Module({ child: module2Child });

    class Test extends Model {}

    Test.defaultProps = {
      modules: () => new List(),
      messages: null
    };

    const model = new Test({
      modules: new List([module1, module2]),
      messages
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
    class Person extends Model {}

    Person.defaultProps = {
      name: ''
    };

    const daughter = new Person({ name: 'Merida' });

    class Test extends Model {}

    Test.defaultProps = {
      name: '',
      daughter: null
    };

    const model = new Test({ name: 'Ben', daughter });
    expect(daughter.__parent__).to.equal(model);

    const updatedModel = model.set('name', 'Maple');
    ensureParentPointerOnChildModels(updatedModel, true);

    expect(daughter.__parent__).to.equal(updatedModel);

    const anotherModel = new Test({ name: 'Ben', daughter });
    ensureParentPointerOnChildModels(anotherModel, true);

    expect(daughter.__parent__).to.equal(anotherModel);
  });

  it('clear', () => {
    class Person extends Model {}

    Person.defaultProps = {
      name: ''
    };

    const daughter = new Person({ name: 'Merida' });

    class Car extends Model {}

    Car.defaultProps = {
      make: ''
    };

    const car1 = new Car({ make: 'BYD' });
    const car2 = new Car({ make: 'Toyota' });

    const address = new Map({
      line1: '275 7th Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    });

    class Test extends Model {}

    Test.defaultProps = {
      name: '',
      cars: new List(),
      daughter: null,
      address: null
    };

    const model = new Test({
      name: 'Ben',
      cars: new List([car1, car2]),
      daughter,
      address
    });

    expect(model.clear().toJS()).to.deep.equal({
      name: '',
      cars: [],
      daughter: null,
      address: null
    });
  });

  it('getIn', () => {
    class Year extends Model {}

    Year.defaultProps = {
      name: ''
    };

    const year2015 = new Year({ name: '2015' });
    const year2016 = new Year({ name: '2016' });

    class Car extends Model {}

    Car.defaultProps = {
      name: '',
      years: () => new List()
    };

    const highlander = new Car({
      name: 'Highlander',
      years: new List([year2015, year2016])
    });

    class Make extends Model {}

    Make.defaultProps = {
      name: '',
      models: new List()
    };

    const toyota = new Make({
      name: 'Toyota',
      models: new List([highlander])
    });

    expect(toyota.getIn(['models', 0, 'name'])).to.equal('Highlander');
    expect(toyota.getIn(['models', 0, 'years', 0])).to.equal(year2015);
    expect(toyota.getIn(['models', 0, 'years', 1])).to.equal(year2016);
    expect(toyota.getIn(['models', 0, 'years', 0, 'name'])).to.equal('2015');
    expect(toyota.getIn(['models', 0, 'years', 1, 'name'])).to.equal('2016');
  });

  it('getIn not exist path', () => {
    class Year extends Model {}

    Year.defaultProps = {
      name: ''
    };

    const year2015 = new Year({ name: '2015' });

    expect(year2015.getIn(['name', 'not_exists'])).to.be.undefined;
    expect(year2015.getIn(['not_exists'])).to.be.undefined;
  });

  it('updateIn with values', () => {
    class Year extends Model {}

    Year.defaultProps = {
      name: ''
    };

    const year2015 = new Year({ name: '2015' });
    const year2016 = new Year({ name: '2016' });

    class Car extends Model {}

    Car.defaultProps = {
      name: '',
      years: () => new List()
    };

    const highlander = new Car({
      name: 'Highlander',
      years: new List([year2015, year2016])
    });

    class Make extends Model {}

    Make.defaultProps = {
      name: '',
      models: new List()
    };

    const toyota = new Make({
      name: 'Toyota',
      models: new List([highlander])
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

    class Car extends Model {}

    Car.defaultProps = {
      name: '',
      seats: 0
    };

    const highlander = new Car({
      name: 'Highlander',
      seats: 4
    });

    const celica = new Car({
      name: 'Celica',
      seats: 2
    });

    class Make extends Model {}

    Make.defaultProps = {
      name: '',
      models: new List()
    };

    const toyota = new Make({
      name: 'Toyota',
      models: new List([highlander, celica])
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
    class StudentModel extends Model {}

    StudentModel.contextTypes = {
      slogan: null,
      headTeacher: null
    };

    class GradeModel extends Model {
      getChildContext() {
        return { slogan: () => `We are ${this.get('name')}` };
      }
    }

    GradeModel.defaultProps = {
      name: '',
      students: () => new List()
    };

    GradeModel.childContextTypes = {
      slogan: null
    };

    class SchoolModel extends Model {
      getChildContext() {
        return { headTeacher: () => this.get('teachers').first() };
      }
    }

    SchoolModel.defaultProps = {
      teachers: () => new List(),
      grades: () => new List()
    };

    SchoolModel.childContextTypes = {
      headTeacher: null
    };

    const studentA = new StudentModel();
    const studentB = new StudentModel();

    const gradeA = new GradeModel({
      name: 'Grade 1',
      students: new List([studentA])
    });

    const gradeB = new GradeModel({
      name: 'Grade 2',
      students: new List([studentB])
    });

    const school = new SchoolModel({
      teachers: new List(['Ray', 'Hoo']),
      grades: new List([gradeA, gradeB])
    });

    expect(school.getChildContext().headTeacher()).to.equal('Ray');
    expect(studentA.getContext('slogan')()).to.equal('We are Grade 1');
    expect(studentA.getContext('headTeacher')()).to.equal('Ray');
    expect(studentB.getContext('slogan')()).to.equal('We are Grade 2');
    expect(studentB.getContext('headTeacher')()).to.equal('Ray');
  });

  it('throws missing context definition', () => {
    class StudentModel extends Model {}

    const studentA = new StudentModel();

    expect(() => {
      studentA.getContext('slogan');
    }).to.throw('Unable to find "slogan" from declared context');
  });

  it('throws missing context', () => {
    class StudentModel extends Model {}

    StudentModel.contextTypes = {
      slogan: null,
      headTeacher: null
    };

    const studentA = new StudentModel();

    expect(() => {
      studentA.getContext('slogan');
    }).to.throw('Unable to find "slogan" from context');
  });

  it('check context type', () => {
    class StudentModel extends Model {}

    StudentModel.contextTypes = {
      slogan: null,
      headTeacher: null
    };

    const studentA = new StudentModel();

    class GradeModel extends Model {
      getChildContext() {
        return { slogan: 1 };
      }
    }

    GradeModel.childContextTypes = {
      slogan: null
    };

    GradeModel.defaultProps = {
      name: '',
      students: new List()
    };

    const gradeA = new GradeModel({
      name: 'Grade 1',
      students: new List([studentA])
    });

    expect(gradeA.getChildContext().slogan).to.equal(1);

    expect(() => {
      studentA.getContext('slogan');
    }).to.throw(
      'Invalid context slogan returned from GradeModel, context should return a function'
    );
  });

  it('should keep stable sender method pointer', () => {
    class StudentModel extends Model {
      sendPromotion() {
        // Return a model prop in order to test 'this'
        return this.get('grade');
      }

      getCurrentGrade() {
        return this.get('grade');
      }
    }

    StudentModel.defaultProps = {
      grade: 1
    };

    const student = new StudentModel();

    const studentPromoted = student.set('grade', 2);

    expect(student).to.not.equal(studentPromoted);
    // Sender function should be stable between old and new models
    expect(student.sendPromotion).to.equal(studentPromoted.sendPromotion);
    expect(student.sendPromotion === studentPromoted.sendPromotion).to.be.true;
    // 'this' in a sender function should be pointing to latest instance
    expect(student.sendPromotion()).to.equal(studentPromoted.sendPromotion());
    // Other extraBindings functions should not be stablized
    expect(student.getCurrentGrade === studentPromoted).to.be.false;
    expect(student.getCurrentGrade()).to.not.equal(
      studentPromoted.getCurrentGrade()
    );
  });

  it('getService', () => {
    class InboxModel extends Model {}

    InboxModel.defaultProps = {
      name: 'messages'
    };

    InboxModel.services = {
      test: function createService() {
        return {
          modelDidMount() {}
        };
      }
    };

    const inbox = new InboxModel();

    expect(inbox.getService('test').modelDidMount).to.be.a('function');
  });

  it('getServices', () => {
    class InboxModel extends Model {}

    InboxModel.defaultProps = {
      name: 'messages'
    };

    InboxModel.services = {
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
    };

    const inbox = new InboxModel();

    const services = inbox.getServices();

    expect(keys(services)).to.deep.include.members(['service1', 'service2']);

    const { service1, service2 } = services;

    expect(service1.modelDidMount).to.be.a('function');
    expect(service2.modelWillUnmount).to.be.a('function');
  });

  it('isPeer', () => {
    class Test extends Model {}

    Test.defaultProps = {
      name: ''
    };

    const model = new Test();

    const newModel = model.set('name', 'new');

    expect(model.isPeer(newModel)).to.be.true;
    expect(newModel.isPeer(model)).to.be.true;
    expect(newModel.isPeer(new Model({}))).to.be.false;
  });

  describe('dispatch', () => {
    class Test extends Model {}

    Test.defaultProps = {
      name: ''
    };

    it('append path to action', () => {
      const dispatch = sinon.spy();
      const model = new Test();

      class Parent extends Model {
        getChildContext() {
          return { dispatch };
        }
      }

      Parent.childContextTypes = {
        dispatch: 'dispatch action to store'
      };
      Parent.defaultProps = { model: null };

      // provide context
      // eslint-disable-next-line no-new
      new Parent({ model });

      model.dispatch({ type: 'TEST_ACTION' });

      expect(dispatch.calledOnce).to.be.true;
      expect(
        dispatch.calledWithMatch({
          type: 'TEST_ACTION',
          path: ['model']
        })
      ).to.be.true;
    });

    it('support calling with action type directly', () => {
      const dispatch = sinon.spy();
      const model = new Test();

      class Parent extends Model {
        getChildContext() {
          return { dispatch };
        }
      }

      Parent.childContextTypes = {
        dispatch: 'dispatch action to store'
      };
      Parent.defaultProps = { model: null };

      // provide context
      // eslint-disable-next-line no-new
      new Parent({ model });

      model.dispatch('TEST_ACTION');

      expect(dispatch.calledOnce).to.be.true;
      expect(
        dispatch.calledWithMatch({
          type: 'TEST_ACTION',
          path: ['model']
        })
      ).to.be.true;
    });
  });
});
