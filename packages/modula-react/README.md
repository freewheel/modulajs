# modula-react

The react binding for modula.

## Installation

```
npm install @modulajs/modula-react
```

## Usage

```
import { createStore, Model } from '@modulajs/modula';
import { createContainer } from '@modulajs/modula-react';
import React from 'react';
import ReactDOM from 'react-dom';

class HelloWorldModel extends Model {
  static defaultProps = {
    message: 'hello world'    
  };
}

const HelloWorldComponent = ({ model }) => (
  <div>{model.get('message')}</div>
);

const store = createStore(HelloWorldModel);
const HelloWorld = createContainer(store, HelloWorldComponent);

ReactDOM.render(HelloWorld);
```

## Hot Zone

modula-react shipped with a tool to drastically accelerate rendering for deep nested components.

```
import { createStore, Model } from '@modulajs/modula';
import { createContainer, hotZone } from '@modulajs/modula-react';
import React from 'react';
import ReactDOM from 'react-dom';

const ActionTypes = {
  UPDATE_NAME: 'USER_PROFILE_UPDATE_NAME'
};

class UserProfileModel extends Model {
  static defaultProps = {
    name: 'user'
  };

  sendNameUpdate(newName) {
    this.dispatch({
      type: ActionTypes.UPDATE_NAME, 
      payload: { name: newName }
    });
  }

  recvNameUpdate() {
    return {
      type: ActionTypes.UPDATE_NAME,
      update(model, action) {
        const { name } = action.payload;

        return [
          model.set('name', name)
        ];
      }
    };
  }
}

class UserSettingsModel extends Model {
  static defaultProps = {
    profile: () => new UserProfileModel()
  };
}

const UserProfileComponent = ({ model }) => (
  <div>
    <span>{model.get('name')}</span>
    <input
      type="text"
      onChange={event => {
        model.sendNameUpdate(event.target.value);
      } 
    />
  </div>
);

// name update will only re-render user profile component
const HotUserProfileComponent = hotZone(UserProfileComponent);

const UserSettingsComponent = ({ model }) => (
  <div>
    <HotUserProfileComponent model={model.get('profile')} />
    ...other user settings...
  </div>
);

const store = createStore(UserSettingsModel);
const UserSettings = createContainer(store, UserSettingsComponent);

ReactDOM.render(UserSettings);
```
