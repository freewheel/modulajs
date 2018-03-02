# eslint-plugin-modulajs

[![NPM version][npm-image]][npm-url]
[![Apache V2 License][apache-2.0]](LICENSE)

This plugin contains any custom eslint rules for use in development on the [modulajs](https://www.npmjs.com/package/modulajs).

## Installation

Prerequisites: Node.js (>=4.x), npm version 2+.

```sh
npm install --save-dev eslint eslint-plugin-modulajs
```

## Usage

Add `modulajs` to the plugins section of ESLint config:
```js
{
  "plugins": [
    "modulajs"
  ]
}
```

## Rules

### `createmodel-attrs-order` <sub>Stylistic Issues</sub>

This rule enforces the order of the keys in the object that is the argument to `createModel`.

Please go to this link [createmodel-attrs-order](docs/rules/createmodel-attrs-order.md) for more details.

### `gettext-params` <sub>Possible Errors</sub>

This rule validates that the proper arguments are provided to the `gettext` family functions.

Please go to this link [gettext-params](docs/rules/gettext-params.md) for more details.

### `no-mutable-event-types-payload-in-models` <sub>Best Practices</sub>
this rule forbid mutable objects in eventTypes/watchEventTypes payload defination.

Please go to this link [no-mutable-event-types-payload-in-models](docs/rules/no-mutable-event-types-payload-in-models.md) for more details.

### `no-mutable-prop-types-in-models` <sub>Best Practices</sub>

By default, this rule checks for the following object-types within the `propTypes` definition in `createModel`.

Please go to this link [no-mutable-prop-types-in-models](docs/rules/no-mutable-prop-types-in-models.md) for more details.

### `use-function-in-model-defaults` <sub>Possible Errors</sub>

This rule validates that any non-primitive prop's default value defined in Model `defaults` should be defined with function.

Please go to this link [use-function-in-model-defaults](docs/rules/use-function-in-model-defaults.md) for more details.

## Contributing

Please read our [contributing guide](CONTRIBUTING.md) for details on how to contribute to our project.

## License

[Apache-2.0](LICENSE)

[npm-url]: https://www.npmjs.com/package/eslint-plugin-modulajs
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-modulajs.svg
[apache-2.0]: http://img.shields.io/badge/license-Apache%20V2-blue.svg