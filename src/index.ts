import App from './app';
import UsersController from './users/user.controller';

global.fetch = require('node-fetch');

const app = new App(
  [
    new UsersController('/'),
  ],
);

app.listen(40661);