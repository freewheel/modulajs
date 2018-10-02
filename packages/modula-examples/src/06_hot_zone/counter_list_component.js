import React from 'react';
import debug from 'debug';
import { hotZone } from 'modula-react';

const hotZoneDebug = debug('modula-example:hotzone');

const CounterComponent = hotZone(({ model }) => (
  <div>
    {hotZoneDebug('render counter component')}
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
));

const SumArea = ({ isMaximumCounts, sum, maxSum }) => (
  <p style={isMaximumCounts ? { color: 'red' } : {}}>
    {' '}
    Sum: {sum} (cannot be higher than {maxSum}){' '}
  </p>
);

const CounterListComponent = ({ model }) => {
  const HotSumArea = hotZone(SumArea, {
    isMaximumCounts: {
      from: model,
      watch: ['counters', '*'],
      get: m => m.isMaximumCounts()
    },
    sum: {
      from: model,
      watch: ['counters', '*'],
      get: m => m.getSum()
    }
  });

  return (
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
      <HotSumArea
        isMaximumCounts={model.isMaximumCounts()}
        sum={model.getSum()}
        maxSum={model.getMaxSum()}
      />
    </div>
  );
};

export default CounterListComponent;
