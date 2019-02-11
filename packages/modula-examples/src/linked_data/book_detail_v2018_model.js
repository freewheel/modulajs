import { Model } from 'modula';
import { inc, dec } from 'ramda';

const ActionTypes = {
  LIKE: 'BOOK_DETAIL_LIKE',
  DISLIKE: 'BOOK_DETAIL_DISLIKE'
};

class BookDetailV2018Model extends Model {
  static defaultProps = {
    title: null,
    likes: 0
  };

  sendLike() {
    this.dispatch({
      type: ActionTypes.LIKE,
    });
  }

  recvLike() {
    return {
      type: ActionTypes.LIKE,
      update(model) {
        return [ model.set('likes', inc) ];
      }
    };
  }

  sendDislike() {
    this.dispatch({
      type: ActionTypes.DISLIKE,
    });
  }

  recvDislike() {
    return {
      type: ActionTypes.DISLIKE,
      update(model) {
        return [ model.set('likes', dec) ];
      }
    };
  }
}

export default BookDetailV2018Model;
