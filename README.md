# Modulajs

A refreshed modulajs.

Besides of regular tech refresh, the guiding principles are:

- achieve higher level joy of writing
- performance in mind
- better interoperatability with react/redux ecosystem

Try best to keep compatibility with current modula, but there might be some breaking changes when the benefit of breaking is overwhelming.

## Prequisites

- Install [Yarn](https://yarnpkg.com/en/)
- Install [Lerna](https://github.com/lerna/lerna)

## CLI Commands

### Bootstrap

`yarn install && yarn bootstrap`

### Start Development

This will listen */src file changes and run lint/test/build as a local pipeline.

`yarn dev`

Web server is available at `http://localhost:1234`.

### Run Example Server Only

`yarn start`

Web server is available at `http://localhost:1234`.

## Manage Packages

### Install new package or upgrade a package

`lerna add <pkg-name> --scope <sub-project-name>`

### Delete package

`lerna exec --scope=<sub-project-name> -- yarn remove <pkg-name>`
