import React from 'react';

export default ({ model }) => (
  <div>
    <p>Title: {model.get('title')}</p>
    <p>Likes by {model.get('likes')}</p>

    <button className="btn btn-primary" onClick={model.sendLike}>
      Like
    </button>
    <button className="btn" onClick={model.sendDislike}>
      Dislike
    </button>
  </div>
);
