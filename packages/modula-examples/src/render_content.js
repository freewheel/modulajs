/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Model as ModulaModel } from 'modula';
import { createContainer } from 'modula-react';

import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { tomorrow } from 'react-syntax-highlighter/styles/prism';

import ReactMarkdown from 'react-markdown';

const ActionTypes = {
  CODE_TAB_CHANGE: 'EXAMPLE_CODE_TAB_CHANGE'
};

const createExampleModel = ({ Model, slug }) => {
  class ExampleModel extends ModulaModel {
    static defaultProps = {
      decoratedModel: () => new Model(),
      slug,
      currentTab: 0
    };
    static actionTypes = ActionTypes;

    sendCodeTabChange(value) {
      this.dispatch({
        type: ActionTypes.CODE_TAB_CHANGE,
        payload: { value }
      });
    }

    recvCodeTabChange() {
      return {
        type: ActionTypes.CODE_TAB_CHANGE,
        update(model, action) {
          const { value } = action.payload;
          const newModel = model.set('currentTab', value);

          return [newModel];
        }
      };
    }
  }

  return ExampleModel;
};

const createExampleComponent = ({
  Component,
  sources,
  Description,
  title
}) => ({ model }) => {
  const id = model.get('slug');
  const sourceFilename = Object.keys(sources)[model.get('currentTab')];

  return (
    <section key={id} id={id} className="columns">
      <div className="column col-md-12 col-6 left">
        <h4>
          <a href={`#{id}`} name={id}>
            {title}
          </a>
        </h4>
        <Description />
        <div className="example">
          <Component model={model.get('decoratedModel')} />
        </div>
      </div>
      <div className="column col-md-12 col-6 right">
        <Tabs
          sources={sources}
          currentTab={model.get('currentTab')}
          onChange={model.sendCodeTabChange}
        />
        <CodeArea name={sourceFilename} code={sources[sourceFilename]} />
      </div>
    </section>
  );
};

function Tab({ label, active, onClick }) {
  return (
    <li className={active ? 'tab-item active' : 'tab-item'}>
      <a
        href="/#"
        className={active ? 'active' : ''}
        onClick={event => {
          event.preventDefault();
          onClick();
        }}
      >
        {label}
      </a>
    </li>
  );
}

function Tabs({ sources, currentTab, onChange }) {
  const tabs = Object.keys(sources).map((key, index) => (
    <Tab
      key={key}
      label={key}
      active={currentTab === index}
      onClick={() => {
        onChange(index);
      }}
    />
  ));

  return <ul className="tab tab-block">{tabs}</ul>;
}

function CodeArea({ name, code }) {
  return (
    <dl key={name}>
      <dd>
        <SyntaxHighlighter language="javascript" style={tomorrow}>
          {code}
        </SyntaxHighlighter>
      </dd>
    </dl>
  );
}

function Doc({ slug, title, source }) {
  return (
    <section id={slug} className="columns">
      <div className="column col-md-12 col-12 doc">
        <h4>
          <a href={`#{slug}`} name={slug}>
            {title}
          </a>
        </h4>
        <div className="markdown">
          <ReactMarkdown source={source} />
        </div>
      </div>
    </section>
  );
}

export default function render(examples, docs) {
  const components = examples
    .map(example => {
      const { Model, Component, title, slug, sources, Description } = example;

      const ExampleModel = createExampleModel({
        Model,
        slug
      });
      const ExampleComponent = createExampleComponent({
        Component,
        title,
        sources,
        Description
      });

      const store = createStore(ExampleModel);
      const Example = createContainer(store, ExampleComponent);

      return <Example key={title} />;
    })
    .concat(
      docs.map(doc => {
        const { slug, title, source } = doc;

        return <Doc key={slug} slug={slug} title={title} source={source} />;
      })
    );

  ReactDOM.render(<div>{components}</div>, document.getElementById('spa'));
}
