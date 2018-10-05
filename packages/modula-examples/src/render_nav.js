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
  const ul = [];
  examples.forEach(example => {
    ul.push(renderLi(example.title));
  });
  return (
    <ul className='nav'>
      {ul}
    </ul>
  );
}

export default function renderNav(examples) {
  ReactDOM.render(renderUl(examples), document.getElementById('sidebar'));
}
