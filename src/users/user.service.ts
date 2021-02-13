
import AWS from 'aws-sdk';
import { 
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback } from 'amazon-cognito-identity-js'
import {DataMapper} from '@aws/dynamodb-data-mapper';
import { User, Customer, Authenticate, AuthenticateResponse } from './type';
import { User as UserDo } from './mappers/user.mapper';
import { Customer as CustomerDo } from './mappers/customer.mapper';
import CognitoPromiseProvider from '../shared/cognito.promise';

const PROJECT_PREFIX = 'JaaS';

export default class UserService {
  region = 'ap-southeast-2';
  userPoolId = 'ap-southeast-2_wnP2MRVYR';
  userPoolClientId = '2p0sequum45vvefo4qi40i4556';

  cognitoidentityserviceprovider: CognitoPromiseProvider;
  userPool: CognitoUserPool;
  ddbClient: AWS.DynamoDB;
  mapper: DataMapper;

  constructor() {
    this.cognitoidentityserviceprovider = new CognitoPromiseProvider({
      apiVersion: '2016-04-18',
      region: this.region,
    });
    this.userPool = new CognitoUserPool({
      UserPoolId: this.userPoolId,
      ClientId: this.userPoolClientId,
    });

    this.ddbClient = new AWS.DynamoDB({ region:this.region });
    this.mapper = new DataMapper({ client: this.ddbClient, tableNamePrefix: PROJECT_PREFIX });
    
    // ensure User table exists
    this.mapper.ensureTableExists(UserDo, {readCapacityUnits: 5, writeCapacityUnits: 5})
    .then(() => console.log('the User table has been provisioned and is ready for use!'));

    // ensure Customer table exists
    this.mapper.ensureTableExists(CustomerDo, {readCapacityUnits: 5, writeCapacityUnits: 5})
    .then(() => console.log('the Customer table has been provisioned and is ready for use!'));
  }

  signUp = async(newUser: User): Promise<string> => {
    console.log(newUser);

    const { email, password, firstName, lastName } = newUser;

    // check existing user
    try {
      const userDo = await this.mapper.get(Object.assign(new UserDo, { id: newUser.email } as UserDo));
      if (userDo) {
        Promise.reject('Existing memeber');
        return;
      }
    } catch (error) {
      console.log('not found');
    }

    // add user to Cognito
    const userAttributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
      new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
    ];
    this.userPool.signUp(email, password, userAttributes, null, (err, result) => {
      console.log(err, result);
      if (err) {
        return;
      }
      console.log(result);
      // add this user to pool
      this.mapper.put(Object.assign(new UserDo, { id: email } as UserDo));
    });
  };

  createUser = async(newUser: User): Promise<void> => {
    console.log(newUser);

    const { email, firstName, lastName } = newUser;

    try {
      const result = await this.cognitoidentityserviceprovider.adminGetUser({
        UserPoolId: this.userPoolId,
        Username: email,
      });
      console.log(result);
      return Promise.reject('existing user');
    } catch (err) {
      console.log('not found', err);
    }

    // add user to Cognito
    try {
      const result = await this.cognitoidentityserviceprovider.adminCreateUser({
        UserPoolId: this.userPoolId,
        Username: email,
        ForceAliasCreation: true,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'given_name', Value: firstName },
          { Name: 'family_name', Value: lastName },
        ],
      });
      console.log(result.User);

      // add this user to pool
      this.mapper.put(Object.assign(new UserDo, { id: email }));
      
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err);
    }
  };

  authenticate = (auth: Authenticate): Promise<AuthenticateResponse> => {
    const { email, password, newPassword } = auth;

    console.log('authenticate', email, password);
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
      ClientMetadata: {
        ['testc']: 'testcc',
      }
    });
    console.log(authenticationDetails);

    return new Promise((resolve, reject) => {
      const authenticationCallback: IAuthenticationCallback = {
        onSuccess: (session, userConfirmationNecessary) => {
          console.log(session, userConfirmationNecessary);
          resolve({
            token: session.getIdToken().getJwtToken(),
            access: session.getAccessToken().getJwtToken(),
            refresh: session.getRefreshToken().getToken(),
          });
        },
        onFailure: err => {
          console.error('onFailure');
          console.error(err.message || JSON.stringify(err));
          reject(err);
        },
        mfaRequired: codeDeliveryDetails => {
          console.log('mfaRequired', codeDeliveryDetails);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log('newPasswordRequired', userAttributes, requiredAttributes);
          if (newPassword == undefined){
            resolve({ newPasswordRequired: true });
            return;
          }
          // These attributes are not mutable and should be removed from map.
          delete userAttributes.email_verified;
          cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, authenticationCallback);
        },
      }
      cognitoUser.authenticateUser(authenticationDetails, authenticationCallback);
    });
  };

  refreshToken = (username: string, refreshToken: string): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });
      const cognitoRefreshToken = new CognitoRefreshToken({
        RefreshToken: refreshToken,
      });
      
      cognitoUser.refreshSession(cognitoRefreshToken, (err, data) => {
        console.log(err, data);
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  };

  refreshTokenTenant = (username: string, zoneinfo: string, refreshToken: string): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });
      const cognitoRefreshToken = new CognitoRefreshToken({
        RefreshToken: refreshToken,
      });
      
      cognitoUser.refreshSession(cognitoRefreshToken, (err, data) => {
        console.log(err, data);
        if (err) {
          reject(err);
          return;
        }
        cognitoUser.updateAttributes([
          {Name: 'zoneinfo', Value: zoneinfo}
        ], (err, data) => {
          console.log(err, data);
          if (err) {
            reject(err);
            return;
          }
          cognitoUser.refreshSession(cognitoRefreshToken, (err, data) => {
            console.log(err, data);
            if (err) {
              reject(err);
              return;
            }
            resolve(data);
          });
        });
      });
    });
  };

  createCustomer = async(userId: string, customer: Customer): Promise<string> => {
    console.log(userId, customer);
    try {
      const result = await this.mapper.put(Object.assign(new CustomerDo, { name: customer.name, sla: customer.sla } as CustomerDo));
      this.mapper.put(Object.assign(new UserDo, { id: userId, customerId: result.id } as UserDo));
      return Promise.resolve(result.id);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  getCustomer = async(userId: string): Promise<Customer> => {
    try {
      const userDo = await this.mapper.get(Object.assign(new UserDo, { id: userId } as UserDo));
      if (!userDo) {
        return Promise.resolve(null);
      }
      if (!userDo.customer) {
        return Promise.resolve(null);
      }

      const customerDo = await this.mapper.get(Object.assign(new CustomerDo, { id: userId } as CustomerDo));
      const customer: Customer = {
        id: customerDo.id,
        name: customerDo.name,
        sla: customerDo.sla,
      };
      return Promise.resolve(customer);
    } catch (error) {
      console.log('not found');
      return Promise.resolve(null);
    }
  };
}