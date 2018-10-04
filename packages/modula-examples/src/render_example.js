/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
import { find, propEq, pipe, toPairs, map } from 'ramda';
import { createStore } from 'modula';
import { createContainer } from 'modula-react';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { tomorrow } from 'react-syntax-highlighter/styles/prism';

function findOrCreate(exampleName) {
  function create(className) {
    const node = document.createElement('div');

    node.className = className;

    return node;
  }

  const spaNode = document.getElementById('spa');

  let node = find(propEq('className', exampleName))(spaNode.childNodes);

  if (node) {
    return node;
  } else {
    node = create(exampleName);
    spaNode.appendChild(node);

    return node;
  }
}

const ContainerTitle = styled.h4`
  width: 12em;
  padding: 2em;
  text-align: right;
  flex-grow: 0;
`;

const ContainerTitleLink = styled.a`
  display: block;
  margin-bottom: 1em;
`;

const ContainerContent = styled.div`
  border-left: 1px solid #aaa;
  padding: 2em;
`;

const Container = styled.section`
  margin-bottom: 2em;
  display: flex;
  flex-direction: row;
`;

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

function shouldRenderAll() {
  const { pathname } = window.location;

  return pathname === '/';
}

function shouldRenderOne(title) {
  const { pathname } = window.location;

  return decodeURI(pathname) === `/${title}`;
}

export default function renderExample({
  title,
  Model,
  Component,
  sources = []
}) {
  if (shouldRenderAll() || shouldRenderOne(title)) {
    const store = createStore(Model);

    const Example = createContainer(store, Component);

    ReactDOM.render(
      <Container>
        <ContainerTitle>
          <ContainerTitleLink
            href={`/${encodeURI(title)}`}
            title="see it in a separate page, which shows more information including source code"
          >
            {title}
          </ContainerTitleLink>
          {shouldRenderOne(title) && <ContainerTitleLink href="/">Go Back</ContainerTitleLink>}
        </ContainerTitle>
        <ContainerContent>
          <Example />
          {shouldRenderOne(title) && <CodeArea sources={sources} />}
        </ContainerContent>
      </Container>,
      findOrCreate(title)
    );
  }
}
