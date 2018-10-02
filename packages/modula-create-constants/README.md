# modula-create-constants

Define action type constants within a namespace.

## Installation

```
npm install @modulajs/modula-create-constants
```

## Usage

```
import createConstants from '@modulajs/modula-create-constants';

const ActionTypes = createConstants('COUNTER', {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT'
});

ActionTypes.INCREMENT === 'COUNTER_INCREMENT';
ActionTypes.DECREMENT === 'COUNTER_DECREMENT';
```
