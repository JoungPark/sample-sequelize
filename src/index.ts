import App from './app';
import UsersController from './users/user.controller';
import SampleController from './sample/sample.controller';

global.fetch = require('node-fetch');

const app = new App(
  [
    new UsersController('/'),
    new SampleController('/sample'),
  ],
);

app.listen(40661);