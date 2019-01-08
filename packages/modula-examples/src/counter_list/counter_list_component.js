import React from 'react';

// reuse component from previous Counter example
import CounterModelComponent from '../counter/counter_component';

const CounterListModelComponent = ({ model }) => (
  <div>
    <div>
      {model
        .get('counters')
        .map((counterModel, index) => (
          <CounterModelComponent key={index} model={counterModel} />
        ))}
    </div>
    <button
      className="btn btn-primary"
      style={{ marginTop: '20px', fontSize: '14px' }}
      onClick={model.sendCounterAdd}
    >
      Add a Counter
    </button>
    <p>Sum: {model.getSum()}</p>
  </div>
);

export default CounterListModelComponent;
