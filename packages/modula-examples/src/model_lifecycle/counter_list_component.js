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
    <p>Sum: {model.getSum()}</p>
  </div>
);

export default CounterListModelComponent;
