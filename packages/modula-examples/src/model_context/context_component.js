import React from 'react';

const GreetingComponent = ({ greeting, locale, onLocaleChange }) => (
  <div>
    <p>{greeting}</p>
    <div>
      <select
        onChange={e => {
          onLocaleChange(e.target.value);
        }}
        value={locale}
      >
        <option value="en_US">American English</option>
        <option value="zh_CN">Simplified Chinese</option>
        <option value="ja_JP">Japanese</option>
      </select>
    </div>
  </div>
);

const GettextModelComponent = ({ model }) => {
  const greetingModel = model.get('decoratedModel');

  return (
    <GreetingComponent
      greeting={greetingModel.sayHello()}
      locale={greetingModel.get('currentLocale')}
      onLocaleChange={greetingModel.sendLocaleChange}
    />
  );
};

export default GettextModelComponent;
