/* eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';

function renderLink(slug, title) {
  return (
    <li className="nav-item" key={slug}>
      <a href={`#${slug}`}>{title}</a>
    </li>
  );
}

function renderLinks(items) {
  return items.map(({ slug, title }) => renderLink(slug, title));
}

export default function renderNav(examples, docs) {
  ReactDOM.render(
    <ul className="nav main">
      <li className="nav-item">
        <span>Examples</span>
        <ul className="nav" id="nav-examples">
          {renderLinks(examples)}
        </ul>
      </li>
      <li className="nav-item">
        <span>Docs</span>
        <ul className="nav" id="nav-docs">
          {renderLinks(docs)}
        </ul>
      </li>
    </ul>,
    document.getElementById('nav')
  );
}
