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

const CounterListComponent = ({ model }) => (
  <div>
    <div>
      {model.get('counters').map(counterModel => (
        <p key={counterModel.get('name')}>
          <CounterComponent model={counterModel} />
        </p>
      ))}
    </div>
    <button
      className="btn btn-primary"
      style={{ marginTop: '20px', fontSize: '14px' }}
      onClick={model.sendCounterAdd}
    >
      Add a Counter
    </button>
    <p style={model.isMaximumCounts() ? { color: 'red' } : {}}>
      {' '}
      Sum: {model.getSum()} (cannot be higher than {model.getMaxSum()}){' '}
    </p>
  </div>
);

export default CounterListComponent;
