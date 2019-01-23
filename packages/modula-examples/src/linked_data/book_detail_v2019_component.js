import React from "react";

export default ({ model }) => (
  <div>
    <span>{model.get('name')} ({model.get('likes')})</span>

    <button className="btn btn-link s-circle" onClick={model.sendLike}>❤️</button>
    <button className="btn btn-link s-circle" onClick={model.sendDislike}>💔</button>
  </div>
);
