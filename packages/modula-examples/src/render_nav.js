/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';

function renderExampleLink(exampleTitle){
  const exampleLink = exampleTitle.replace(/ /g,'-').toLowerCase();

  return (
    <li className="nav-item" key={exampleLink}>
      <a href={`#${exampleLink}`} id={`${exampleLink}-link`}>{exampleTitle}</a>
    </li>
  )
}

function renderExampleLinkList(examples) {
  return examples.map(example => (
    renderExampleLink(example.title)
  ));
}

export default function renderNav(examples) {
  ReactDOM.render(renderExampleLinkList(examples), document.getElementById('nav-examples'));
}
