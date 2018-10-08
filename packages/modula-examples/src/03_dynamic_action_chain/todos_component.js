import React from 'react';
import { map } from 'ramda';

const TodosComponent = ({ model }) => (
  <div>
    <h5>TODOs</h5>
    <ul>
      {map(todo => <li key={todo}>{todo}</li>, model.get('todos'))}
      <li>
        <button className="btn" onClick={model.sendAdd}>
          Add a new TODO
        </button>
      </li>
    </ul>
    <div>
      <button className="btn btn-primary" onClick={model.sendDeleteOneByOne}>
        Delete TODOs Sequentially
      </button>
    </div>
  </div>
);

export default TodosComponent;
