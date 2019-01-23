import { Model } from 'modula';
import { equals } from 'ramda';
import BookDetailV2018Model from './book_detail_v2018_model';
import BookDetailV2019Model from './book_detail_v2019_model';

const intervalService = function intervalService(interval, onTime) {
  return function createService(getModel) {
    let intervalId = null;

    return {
      modelDidMount() {
        intervalId = setInterval(() => {
          onTime(getModel());
        }, interval);
      },

      modelWillUnmount() {
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
      }
    };
  };
};

const ActionTypes = {
  INIT: 'BOOK_DETAIL_COMPARISION_INIT',
  LIKE_MORE: 'BOOK_DETAIL_COMPARISION_LIKE_MORE'
};

class BookDetailExpoModel extends Model {
  static defaultProps = {
    // there're 3 copies of the "same" data in this example
    //
    // expo model keeps a copy of data
    book: null,
    // 2018 detail model keeps another copy of data
    bookDetailV2018: null,
    // 2019 detail model also keeps a copy of data
    bookDetailV2019: null,
    isLoading: true
  };

  static services = {
    // increase like by 1 every 5 seconds
    automaticLike: intervalService(5000, model => {
      model.sendLikeMore(1);
    })
  };

  modelWillUpdate(oldModel) {
    // reconcile book attributes in different models
    //
    // this case is complicated since all 3 books can have updates
    // meaning there's no single source of truth
    // so we need to handle update differently base on the source of a change

    if (oldModel.get('bookDetailV2018') !== this.get('bookDetailV2018')) {
      const bookFromV2018 = {
        name: this.get('bookDetailV2018').get('title'),
        likes: this.get('bookDetailV2018').get('likes')
      };

      if (equals(this.get('book'), bookFromV2018)) {
        return this;
      } else {
        // take 2018 book value as the primary value
        return this.setMulti({
          book: bookFromV2018,
          bookDetailV2019: origin => {
            if (origin) {
              return origin.setMulti({
                name: bookFromV2018.name,
                likes: bookFromV2018.likes
              });
            } else {
              return origin;
            }
          }
        });
      }
    }

    if (oldModel.get('bookDetailV2019') !== this.get('bookDetailV2019')) {
      const bookFromV2019 = {
        name: this.get('bookDetailV2019').get('name'),
        likes: this.get('bookDetailV2019').get('likes')
      };

      if (equals(this.get('book'), bookFromV2019)) {
        return this;
      } else {
        // take 2019 book value as the primary value
        return this.setMulti({
          book: bookFromV2019,
          bookDetailV2018: origin => {
            if (origin) {
              return origin.setMulti({
                title: bookFromV2019.name,
                likes: bookFromV2019.likes
              });
            } else {
              return origin;
            }
          }
        });
      }
    }

    if (!equals(oldModel.get('book'), this.get('book'))) {
      const bookFromModel = this.get('book');

      // take model book value as the primary value
      return this.setMulti({
        bookDetailV2018: origin => {
          if (origin) {
            return origin.setMulti({
              title: bookFromModel.name,
              likes: bookFromModel.likes
            });
          } else {
            return origin;
          }
        },
        bookDetailV2019: origin => {
          if (origin) {
            return origin.setMulti({
              name: bookFromModel.name,
              likes: bookFromModel.likes
            });
          } else {
            return origin;
          }
        }
      });
    }

    return this;
  }

  modelDidMount() {
    this.sendInit();
  }

  sendInit() {
    this.dispatch({
      type: ActionTypes.INIT,
      payload: {
        book: {
          name: 'Man Month Myth',
          likes: 150
        }
      }
    });
  }

  recvInit() {
    return {
      type: ActionTypes.INIT,
      update: (model, action) => {
        const { book } = action.payload;
        return [
          model.setMulti({
            book,
            bookDetailV2018: new BookDetailV2018Model({
              title: book.name,
              likes: book.likes
            }),
            bookDetailV2019: new BookDetailV2019Model({
              name: book.name,
              likes: book.likes
            }),
            isLoading: false
          })
        ];
      }
    };
  }

  sendLikeMore(likes) {
    this.dispatch({
      type: ActionTypes.LIKE_MORE,
      payload: { likes }
    });
  }

  recvLikeMore() {
    return {
      type: ActionTypes.LIKE_MORE,
      update: (model, action) => {
        const { likes } = action.payload;

        if (model.get('book')) {
          return [
            model.set('book', {
              name: model.get('book').name,
              likes: model.get('book').likes + likes
            })
          ];
        } else {
          return [model];
        }
      }
    };
  }
}

export default BookDetailExpoModel;
