import express from 'express';
import RestController from '../rest-controller.interface';
import UserService from './user.service';
import { Authenticate, User, Customer } from './type';

class UsersController implements RestController {
  path = '/';
  router = express.Router();
  userService = new UserService();

  constructor(path: string) {
    this.path = path;
    this.intializeRoutes();
  }

  intializeRoutes(): void {
    this.router.get(this.path, this.getHealth);
    this.router.get(this.path + 'health', this.getHealth);
    this.router.post(this.path, this.createUser);
    this.router.post(this.path + 'reg', this.createUser);
    this.router.post(this.path + 'auth', this.authenticate);
    this.router.post(this.path + 'password/reset', this.resetPassword);
    this.router.post(this.path + 'password/change', this.changePassword);
    this.router.get(this.path + 'customer', this.parseJwtToken, this.getCustomer);
    this.router.post(this.path + 'customer', this.parseJwtToken, this.createCustomer);

    this.router.get(this.path + 'refreshtoken', this.refreshToken);
    this.router.get(this.path + 'refreshtoken/tenant', this.parseJwtToken, this.refreshTokenTenant);
  }

  getHealth = (req: express.Request, res: express.Response): void => {
    res.send({controller: 'user controller', timestamp: Date.now()});
  };

  parseJwtToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      res.status(403).send({error: 'no authorization', timestamp: Date.now()});
      return;
    }
    const tokenType = 'Bearer';
    if (!authorization.startsWith(tokenType)) {
      res.status(403).send({error: 'invalid authorization', timestamp: Date.now()});
      return;
    }

    const tokenString = authorization.substr(tokenType.length + 1);
    const [, second, ] = tokenString.split('.');
    if (!second) {
      res.status(403).send({error: 'invalid authorization', timestamp: Date.now()});
      return;
    }
    
    const payloadStr = Buffer.from(second, 'base64').toString('ascii');
    const payload = JSON.parse(payloadStr);
    // console.log(payload);

    req.userId = payload.email;

    next();
  };

  createUser = (req: express.Request, res: express.Response): void => {
    const user: User = req.body;
    const { email, firstName, lastName } = user;
    if (!email || !firstName || !lastName) {
      res.status(400).send('missing credential');
      return;
    }
    this.userService.createUser(user);
    res.send(user);
  };
  
  authenticate = (req: express.Request, res: express.Response): void => {
    const auth: Authenticate = req.body;
    const {email, password} = auth;
    if (!email || !password) {
      res.status(400).send('missing credential');
      return;
    }
    this.userService.authenticate(auth)
    .then(tokens => res.send(tokens))
    .catch(err => {console.log(err); res.status(501).send(err);});
  };
  
  createCustomer = (req: express.Request, res: express.Response): void => {
    const userId = req.userId;
    const customer: Customer = req.body;
    this.userService.createCustomer(userId, customer);
    res.send(customer);
  };
  
  getCustomer = (req: express.Request, res: express.Response): void => {
    const userId = req.query.userId as string;
    this.userService.getCustomer(userId)
    .then(customer => res.send(customer))
    .catch(err => res.status(500).send(err));
  };

  refreshToken = (req: express.Request, res: express.Response): void => {
    const refreshToken = req.headers['refresh'] as string;
    const userId = req.userId;
    console.log({userId, refreshToken});

    this.userService.refreshToken(userId, refreshToken)
    .then(tokens => res.send(tokens))
    .catch(err => res.status(500).send(err));
  };

  refreshTokenTenant = (req: express.Request, res: express.Response): void => {
    const refreshToken = req.headers['refresh'] as string;
    const tenant = req.query.tenant as string;
    const userId = req.userId;
    console.log({userId, tenant, refreshToken});

    this.userService.refreshTokenTenant(userId, tenant, refreshToken)
    .then(tokens => res.send(tokens))
    .catch(err => res.status(500).send(err));
  };

  resetPassword = (req: express.Request, res: express.Response): void => {
    res.status(501).send({function: 'resetPassword', timestamp: Date.now()});
  };
  changePassword = (req: express.Request, res: express.Response): void => {
    res.status(501).send({function: 'resetPassword', timestamp: Date.now()});
  };
}

export default UsersController;