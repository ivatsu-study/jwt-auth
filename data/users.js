const { hashSync } = require('bcryptjs');

module.exports = [
  {
    id: 1,
    login: 'Ivan',
    password: hashSync('Ivan'),
  },
  {
    id: 2,
    login: 'Johan',
    password: hashSync('Johan'),
  },
];
