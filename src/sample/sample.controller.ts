import express from 'express';
import RestController from '../rest-controller.interface';
import { doStuffWithUser } from './sample.service';

class SampleController implements RestController {
  path = '/sample';
  router = express.Router();

  constructor(path: string) {
    this.path = path;
    this.intializeRoutes();
  }

  intializeRoutes(): void {
    this.router.get(this.path, this.getHealth);
  }

  getHealth = (req: express.Request, res: express.Response): void => {
    doStuffWithUser();
    res.send({controller: 'sample controller', timestamp: Date.now()});
  };
}

export default SampleController;