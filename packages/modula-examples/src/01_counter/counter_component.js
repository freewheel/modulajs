import React from 'react';

const CounterComponent = ({ model }) => (
  <div>
    <p>
      Counter:
      <span data-test-name="counter">{model.get('value')}</span>
    </p>
    <div>
      {' '}
      <button
        data-test-name="increment"
        className="btn"
        onClick={model.sendIncrement}
      >
        +
      </button>{' '}
      <button
        data-test-name="decrement"
        className="btn"
        onClick={model.sendDecrement}
      >
        -
      </button>
    </div>
  </div>
);

export default CounterComponent;
