import React from 'react';

/* eslint-env browser */
import ReactDOM from 'react-dom';
import { createStore, Model as ModulaModel } from 'modula';
import { createContainer } from 'modula-react';

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


    // TODO: this model should be the child of a Page model, which also contains the nav model
    // and retains the current focus id in it's context
    sendMouseOver() {
      const exampleLinkId = `${this.get('title').replace(/ /g,'-').toLowerCase()}-link`;
      document.getElementById(exampleLinkId).classList.add('hover');
    }

    sendMouseOut() {
      const exampleLinkId = `${this.get('title').replace(/ /g,'-').toLowerCase()}-link`;
      document.getElementById(exampleLinkId).classList.remove('hover');
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

const createExampleComponent = Component => ({ model }) => {
  const id = model.get('title').replace(/ /g,'-').toLowerCase();
  return (
    <section 
      key={id} 
      id={id} 
      className='columns' 
      onMouseOver={() => model.sendMouseOver()}
      onFocus={() => model.sendMouseOver()}
      onMouseOut={() => model.sendMouseOut()}
      onBlur={() => model.sendMouseOut()}
    >
      <div className='column col-md-12 col-6 left'>
        <h4>
          <a
            href={`#${id}`}
            title="see it in a separate page, which shows more information including source code"
          >
            {model.get('title')}
          </a>
        </h4>
        <p>
          {model.get('description')}
        </p>
        <div className='example'>
          <Component model={model.get('decoratedModel')} />
        </div>
      </div>
      <div className='column col-md-12 col-6 right'>
        <Tabs sources={model.get('sources')} display={model.get('display')} onDisplayChange={model.sendDisplayChange} />
        <CodeArea sources={model.get('sources')} display={model.get('display')} />
      </div>
    </section>
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
      key={key}
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

function CodeArea({ sources, display }) {
  const key = Object.keys(sources)[display];
  const fileName = sources[key];
  const fileContent = sources[key];
  return (
    <dl key={fileName}>
      <dd>
        <SyntaxHighlighter language="javascript" style={tomorrow}>
          {fileContent}
        </SyntaxHighlighter>
      </dd>
    </dl>
  );
}

export default function renderExamples(examples) {
  const exampleComponents = examples.map(example => {
    const { Model, Component, title, sources, description } = example;

    const ExampleModel = createExampleModel({ Model, title, sources, description });
    const ExampleComponent = createExampleComponent(Component);

    const store = createStore(ExampleModel);
    const Example = createContainer(store, ExampleComponent);

    return <Example key={title} />;
  });

  ReactDOM.render(
    <span>
      {exampleComponents}
    </span>,
    document.getElementById('spa')
  );
}