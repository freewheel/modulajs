# modula

A modularization framework to manage application states.

## Installation

```
npm install @modulajs/modula
```

## Usage

with react binding

```
import { createStore, Model } from '@modulajs/modula';
import { createContainer } from '@modulajs/modula-react';
import React from 'react';
import ReactDOM from 'react-dom';

const ActionTypes = {
  SAY_LOUDER: 'HELLO_WORLD_SAY_LOUDER'
};

class HelloWorldModel extends Model {
  static defaultProps = {
    message: 'hello world'    
  };

  sendSayLouder() {
    this.dispatch({ type: ActionTypes.SAY_LOUDER });
  }

  recvSayLouder() {
    return {
      type: ActionTypes.SAY_LOUDER,
      update(model) {
        const newModel = model.set('message', 'HELLO WORLD!');

        return [ newModel ];
      }
    };
  }
}

const HelloWorldComponent = ({ model }) => (
  <div>{model.get('message')}</div>
);

const store = createStore(HelloWorldModel);
const HelloWorld = createContainer(store, HelloWorldComponent);

ReactDOM.render(HelloWorld);
```
