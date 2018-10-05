import React from 'react';

/* eslint-env browser */
import ReactDOM from 'react-dom';
import { pipe, toPairs, map } from 'ramda';
import { createStore, Model as ModulaModel } from 'modula';
import { createContainer } from 'modula-react';

import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { tomorrow } from 'react-syntax-highlighter/styles/prism';

const ActionTypes = {
  DISPLAY_CHANGE: 'EXAMPLE_DISPLAY_CHANGE'
};

const DISPLAY = {
  EXAMPLE: 0,
  COMPONENT: 1,
  MODEL: 2
};

const createExampleModel = ({ Model, title, sources }) => {
  class ExampleModel extends ModulaModel {
    sendDisplayChange(value) {
      this.dispatch({ 
        type: ActionTypes.DISPLAY_CHANGE,
        payload: { value }
    });
    }

    recvDisplayChange() {
      return {
        type: ActionTypes.DISPLAY_CHANGE,
        update(model, action) {
          const { value } = action.payload;
          const newModel = model.set('display', value);
          return [newModel];
        }
      };
    }
  }

  ExampleModel.defaultProps = {
    decoratedModel: () => new Model(),
    title,
    sources,
    display: DISPLAY.EXAMPLE
  };
  ExampleModel.actionTypes = ActionTypes;

  return ExampleModel;
};

const createExampleComponent = Component => ({ model }) => {
  const id = model.get('title').replace(/ /g,'-').toLowerCase();
  return (
    <Container key={id} id={id}>
      <ContainerTitle>
        <ContainerTitleLink
          href={`#${id}`}
          title="see it in a separate page, which shows more information including source code"
        >
          {model.get('title')}
        </ContainerTitleLink>
      </ContainerTitle>
      <ContainerDescription>
        This will be the example description which will be available in the example model. The model can either be used as a function or extended from the base class.
      </ContainerDescription>
      <ContainerContent>
        <Tabs display={model.get('display')} onDisplayChange={model.sendDisplayChange} />
        <Component model={model.get('decoratedModel')} />
        <CodeArea sources={model.get('sources')} />
      </ContainerContent>
    </Container>
  );
};

function Tabs({ display, onDisplayChange }){
  return (
    <ul className="tab tab-block">
      <li 
        className={(DISPLAY.EXAMPLE === display) ? 'tab-item active' : 'tab-item'}
      >
        <a 
          href="/#" 
          className={(DISPLAY.EXAMPLE === display) ? 'active' : ''}
          onClick={() => onDisplayChange(DISPLAY.EXAMPLE)}
        >
          Example
        </a>
      </li>
      <li 
        className={(DISPLAY.COMPONENT === display) ? 'tab-item active' : 'tab-item'}
      >
        <a 
          href="/#" 
          className={(DISPLAY.COMPONENT === display) ? 'active' : ''}
          onClick={() => onDisplayChange(DISPLAY.COMPONENT)}
        >
          Component
        </a>
      </li>
      <li 
        className={(DISPLAY.MODEL === display) ? 'tab-item active' : 'tab-item'}
      >
        <a 
          href="/#" 
          className={(DISPLAY.MODEL === display) ? 'active' : ''}
          onClick={() => onDisplayChange(DISPLAY.MODEL)}
        >
          Model
        </a>
      </li>
    </ul>
  );
}

const Container = styled.section`
  margin: 1em 0 2em 1em;
`;

const ContainerTitle = styled.h4``;

const ContainerTitleLink = styled.a``;

const ContainerDescription = styled.p`
  padding: 0em 4em 0em 4em;
  font-size: .9em;
`;

const ContainerContent = styled.div``;

const SourceCode = styled.dl`
  padding-top: 20px;
`;

const SourceCodeTitle = styled.dt`
  font-weight: bold;
  margin-bottom: 8px;
`;

const SourceCodeBody = styled.dd`
  margin: 0;
`;

function CodeArea({ sources }) {
  return pipe(
    toPairs,
    map(([fileName, fileContent]) => (
      <SourceCode key={fileName}>
        <SourceCodeTitle>{fileName}</SourceCodeTitle>
        <SourceCodeBody>
          <SyntaxHighlighter language="javascript" style={tomorrow}>
            {fileContent}
          </SyntaxHighlighter>
        </SourceCodeBody>
      </SourceCode>
    ))
  )(sources);
}

export default function renderExamples(examples) {
  const exampleComponents = examples.map(example => {
    const { Model, Component, title, sources } = example;

    const ExampleModel = createExampleModel({ Model, title, sources });
    const ExampleComponent = createExampleComponent(Component);

    const store = createStore(ExampleModel);
    const Example = createContainer(store, ExampleComponent);

    return <Example />;
  });

  ReactDOM.render(
    <span>
      {exampleComponents}
    </span>,
    document.getElementById('spa')
  );
}