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

const CounterListComponent = ({ model }) => (
  <div>
    <div>
      {model.get('counters').map(counterModel => (
        <p key={counterModel.get('name')}>
          <CounterComponent model={counterModel} />
        </p>
      ))}
    </div>
    <ul>{model.get('messages').map(message => <li>{message}</li>)}</ul>
    <div className="btn-group btn-group-block">
      <button
        className="btn btn-primary"
        style={{ marginTop: '20px', fontSize: '14px' }}
        onClick={model.sendCounterAdd}
      >
        Add a Counter
      </button>
      <button
        className="btn btn-primary"
        style={{ marginTop: '20px', fontSize: '14px' }}
        onClick={model.sendCounterRemove}
      >
        Delete first Counter
      </button>
      <button
        className="btn btn-primary"
        style={{ marginTop: '20px', fontSize: '14px' }}
        onClick={model.sendMessagesClear}
      >
        Clear Messages
      </button>
    </div>
    <p style={model.isMaximumCounts() ? { color: 'red' } : {}}>
      {' '}
      Sum: {model.getSum()} (cannot be higher than {model.getMaxSum()}){' '}
    </p>
  </div>
);

export default CounterListComponent;
