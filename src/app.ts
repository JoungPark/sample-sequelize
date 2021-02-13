import express from 'express';
import bodyParser from 'body-parser';
import RestController from './rest-controller.interface';

class App {
  public app: express.Application;

  constructor(controllers: RestController[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
      console.log(`${request.method} ${request.path}`);
      next();
    });
  }

  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });
  }
}

export default App;