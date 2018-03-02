Constants are key-value maps of strings. It's important for defining action types. ModulaJS offers a helper function to create constants.

It's recommended to define action specific constants at top of a ModulaJS Model file.

```javascript
import { createConstants } from 'modulajs';

// namespace, an object for constants like KeyMirror
export const ActionTypes = createConstants('MESSAGES', {
  CLEAR: null
});

// ActionTypes.CLEAR === 'MESSAGES_CLEAR'
```

Like [KeyMirror](https://github.com/STRML/keyMirror), which creates an object with values equal to its key names, but with namespace.

Please refer to [ModulaJS Constants API](api/constants_api.md) for more information.
