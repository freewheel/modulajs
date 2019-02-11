import React from 'react';
import BookDetailV2018Component from './book_detail_v2018_component';
import BookDetailV2019Component from './book_detail_v2019_component';

export default ({ model }) => {
  if (model.get('isLoading')) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <dl>
          <dt>2018 Book Detail Design</dt>
          <dd>
            <BookDetailV2018Component model={model.get('bookDetailV2018')} />
          </dd>
        </dl>
        <dl>
          <dt>2019 Book Detail Design</dt>
          <dd>
            <BookDetailV2019Component model={model.get('bookDetailV2019')} />
          </dd>
        </dl>
      </div>
    );
  }
};
