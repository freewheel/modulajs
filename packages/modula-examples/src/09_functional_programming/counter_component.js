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
        className="btn"
        data-test-name="increment"
        onClick={model.sendIncrement}
      >
        +
      </button>{' '}
      <button
        className="btn"
        data-test-name="decrement"
        onClick={model.sendDecrement}
      >
        -
      </button>
    </div>
  </div>
);

export default CounterComponent;
