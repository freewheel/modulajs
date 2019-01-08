import { Model } from 'modula';

const GreetingActionTypes = {
  LOCALE_CHANGE: 'HELLO_LOCALE_CHANGE'
};

// context consumer
class GreetingModel extends Model {
  static actionTypes = GreetingActionTypes;

  static defaultProps = {
    currentLocale: 'en_US'
  };

  // implicitly declares dependencies on context methods
  static contextTypes = {
    gettext: 'translate string base on locale'
  };

  sendLocaleChange(locale) {
    this.dispatch({
      type: GreetingActionTypes.LOCALE_CHANGE,
      payload: { locale }
    });
  }

  recvLocaleChange() {
    return {
      type: GreetingActionTypes.LOCALE_CHANGE,
      update(model, action) {
        const { locale } = action.payload;

        return [model.set('currentLocale', locale)];
      }
    };
  }

  sayHello() {
    // calling this.getContext to access context method
    const _ = this.getContext('gettext');

    return _(this.get('currentLocale'), 'hello');
  }
}

// context provider
class GettextModel extends Model {
  static defaultProps = {
    translations: {
      en_US: {
        hello: 'hello'
      },
      zh_CN: {
        hello: '你好'
      },
      ja_JP: {
        hello: 'こんにちは'
      }
    },
    decoratedModel: () => new GreetingModel()
  };

  // declares what context method are available for descandant models
  static childContextTypes = {
    gettext: 'translate string base on locale'
  };

  // returns context methods
  getChildContext() {
    return {
      gettext: (locale, string) => this.get('translations')[locale][string]
    };
  }
}

export default GettextModel;
