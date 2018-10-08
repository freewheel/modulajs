import React from 'react';

/* eslint-env browser */
import ReactDOM from 'react-dom';
import { createStore, Model as ModulaModel } from 'modula';
import { createContainer } from 'modula-react';

import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { tomorrow } from 'react-syntax-highlighter/styles/prism';

const ActionTypes = {
  DISPLAY_CHANGE: 'EXAMPLE_DISPLAY_CHANGE'
};

const createExampleModel = ({ Model, title, sources, description }) => {
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

    sendMouseOver() {
      // TODO: this model should be the child of a Page model, which also contains the nav model
      // and retains the current focus id in it's context
      const exampleLinkId = `#${this.get('title').replace(/ /g,'-').toLowerCase()}-link`;
      $('.nav-item a').removeClass('hover'); 
      $(exampleLinkId).addClass('hover');
    }
  }

  ExampleModel.defaultProps = {
    decoratedModel: () => new Model(),
    title,
    description,
    sources,
    display: 0
  };
  ExampleModel.actionTypes = ActionTypes;

  return ExampleModel;
};

const Container = styled.section`
  margin: 0;
`;

const ContainerTitle = styled.h4`
  padding: 1em;
`;

const ContainerTitleLink = styled.a``;

const ContainerDescription = styled.p`
  padding: 0em 4em 0em 4em;
  font-size: .9em;
`;

const createExampleComponent = Component => ({ model }) => {
  const id = model.get('title').replace(/ /g,'-').toLowerCase();
  return (
    <Container 
      key={id} 
      id={id} 
      className='columns' 
      onMouseOver={() => model.sendMouseOver()}
      onFocus={() => model.sendMouseOver()}
    >
      <div className='column col-md-12 col-6'>
        <ContainerTitle>
          <ContainerTitleLink
            href={`#${id}`}
            title="see it in a separate page, which shows more information including source code"
          >
            {model.get('title')}
          </ContainerTitleLink>
        </ContainerTitle>
        <ContainerDescription>
          {model.get('description')}
        </ContainerDescription>
        <div className='example'>
          <Component model={model.get('decoratedModel')} />
        </div>
      </div>
      <div className='column col-md-12 col-6 right'>
        <Tabs sources={model.get('sources')} display={model.get('display')} onDisplayChange={model.sendDisplayChange} />
        <CodeArea sources={model.get('sources')} display={model.get('display')} />
      </div>
    </Container>
  );
};

function Tab({index, title, display, onDisplayChange}){
  return (
    <li 
      className={(index === display) ? 'tab-item active' : 'tab-item'}
      key={index}
    >
      <a 
        href="/#" 
        className={(index === display) ? 'active' : ''}
        onClick={() => onDisplayChange(index)}
      >
        {title}
      </a>
    </li>
  )
}

function Tabs({ sources, display, onDisplayChange }){
  const tabs = Object.keys(sources).map((key, index) => (
    <Tab 
      index={index} 
      title={key} 
      display={display} 
      onDisplayChange={onDisplayChange} 
    />)
  );
  return (
    <ul className="tab tab-block">
      {tabs}
    </ul>
  );
}

const SourceCode = styled.dl`
  padding-top: 20px;
`;

const SourceCodeBody = styled.dd`
  margin: 0;
  font-size: .8em;
`;

function CodeArea({ sources, display }) {
  const key = Object.keys(sources)[display];
  const fileName = sources[key];
  const fileContent = sources[key];
  return (
    <SourceCode key={fileName}>
      <SourceCodeBody>
        <SyntaxHighlighter language="javascript" style={tomorrow}>
          {fileContent}
        </SyntaxHighlighter>
      </SourceCodeBody>
    </SourceCode>
  );
}

export default function renderExamples(examples) {
  const exampleComponents = examples.map(example => {
    const { Model, Component, title, sources, description } = example;

    const ExampleModel = createExampleModel({ Model, title, sources, description });
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