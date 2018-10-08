/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';

function renderLi(exampleTitle){
  const exampleLink = exampleTitle.replace(/ /g,'-').toLowerCase();

  return (
    <li className="nav-item" key={exampleLink}>
      <a href={`#${exampleLink}`}>{exampleTitle}</a>
    </li>
  )
}

function renderUl(examples) {
  return examples.map(example => (
    renderLi(example.title)
  ));
}

export default function renderNav(examples) {
  ReactDOM.render(renderUl(examples), document.getElementById('nav-examples'));
}
