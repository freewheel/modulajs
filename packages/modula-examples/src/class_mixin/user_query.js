import { slice, prop, pipe, sortBy, when, always, reverse } from 'ramda';

const UserDB = [
  { id: 1, name: 'Diane' },
  { id: 2, name: 'Jon' },
  { id: 3, name: 'Doug' },
  { id: 4, name: 'Jack' },
  { id: 5, name: 'Kevin' },
  { id: 6, name: 'Micheal' },
  { id: 7, name: 'Joey' }
];

function query({ page, perPage, by, order }) {
  const sort = pipe(sortBy(prop(by)), when(always(order === 'desc'), reverse));
  const cutPage = slice((page - 1) * perPage, page * perPage);

  return pipe(sort, cutPage)(UserDB);
}

export default query;
