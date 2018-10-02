import React from 'react';
import { map } from 'ramda';

const Pagination = ({ page, perPage, onPageChange, onPerPageChange }) => (
  <div style={{ marginTop: '10px' }}>
    Per Page
    <select
      className="form-select"
      style={{ width: '50px', margin: '0 8px' }}
      value={perPage}
      onChange={event => {
        onPerPageChange(parseInt(event.target.value, 10));
      }}
    >
      <option value="5">5</option>
      <option value="10">10</option>
    </select>
    ~ Current Page {page} ~
    <div
      className="btn-group btn-group-block"
      style={{ display: 'inline-block', marginLeft: '8px' }}
    >
      <button
        className="btn"
        disabled={page <= 1}
        onClick={event => {
          event.preventDefault();

          onPageChange(page - 1);
        }}
      >
        Prev
      </button>
      <button
        className="btn"
        onClick={event => {
          event.preventDefault();

          onPageChange(page + 1);
        }}
      >
        Next
      </button>
    </div>
  </div>
);

const SortableHead = ({ isAsc, isDesc, children }) => (
  <span>
    {children}
    {isAsc && '▲'}
    {isDesc && '▼'}
  </span>
);

const TestComponent = ({ model }) => (
  <div>
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th
            onClick={() => {
              model.sendSortToggle('id');
            }}
          >
            <SortableHead
              isAsc={model.isSortAsc('id')}
              isDesc={model.isSortDesc('id')}
            >
              ID
            </SortableHead>
          </th>
          <th
            onClick={() => {
              model.sendSortToggle('name');
            }}
          >
            <SortableHead
              isAsc={model.isSortAsc('name')}
              isDesc={model.isSortDesc('name')}
            >
              Name
            </SortableHead>
          </th>
        </tr>
      </thead>
      <tbody>
        {map(
          user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
            </tr>
          ),
          model.get('users')
        )}
      </tbody>
    </table>
    <Pagination
      page={model.getPage()}
      perPage={model.getPerPage()}
      onPageChange={model.sendPageChange}
      onPerPageChange={model.sendPerPageChange}
    />
  </div>
);

export default TestComponent;
