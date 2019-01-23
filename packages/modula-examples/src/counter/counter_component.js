import React from 'react';

// pure react component
const CounterComponent = ({ value, onIncrement, onDecrement }) => (
  <div>
    <p>
      Counter: <span>{value}</span>
    </p>
    <div>
      {' '}
      <button className="btn" onClick={onIncrement}>
        +
      </button>{' '}
      <button className="btn" onClick={onDecrement}>
        -
      </button>
    </div>
  </div>
);

// a thin layer that glues a model and a react component
// as a convention we recommend naming a component
// that accepts model parameter as XxModelComponent
const CounterModelComponent = ({ model }) => (
  <CounterComponent
    value={model.get('value')}
    onIncrement={model.sendIncrement}
    onDecrement={model.sendDecrement}
  />
);

export default CounterModelComponent;
