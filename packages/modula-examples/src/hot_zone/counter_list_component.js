import React from 'react';
import { hotZone } from 'modula-react';

// reuse component from previous Counter example
import CounterModelComponent from '../counter/counter_component';

const SumArea = ({ sum }) => <p>Sum: {sum}</p>;

const CounterListModelComponent = ({ model }) => {
  const HotSumArea = hotZone(SumArea, {
    sum: {
      from: model,
      watch: ['counters', '*'],
      get: m => m.getSum()
    }
  });

  const HotCounterModelComponent = hotZone(CounterModelComponent);

  return (
    <div>
      <div>
        {model
          .get('counters')
          .map((counterModel, index) => (
            <HotCounterModelComponent key={index} model={counterModel} />
          ))}
      </div>
      <button
        className="btn btn-primary"
        style={{ marginTop: '20px', fontSize: '14px' }}
        onClick={model.sendCounterAdd}
      >
        Add a Counter
      </button>
      <HotSumArea />
    </div>
  );
};

export default CounterListModelComponent;
