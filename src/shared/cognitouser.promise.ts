import { 
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserSession,
  ICognitoUserAttributeData,
  ICognitoUserData } from 'amazon-cognito-identity-js'

export default class CognitoUserPromise {
  cognitoUser: CognitoUser;

  constructor(data: ICognitoUserData) {
    this.cognitoUser = new CognitoUser(data);
  }

  refreshSession = (refreshToken: CognitoRefreshToken)
    : Promise<CognitoUserSession> => new Promise((resolve, reject) => {
    this.cognitoUser.refreshSession(refreshToken, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  });

  updateAttributes = (attributes: (CognitoUserAttribute | ICognitoUserAttributeData)[])
    : Promise<string> => new Promise((resolve, reject) => {
    this.cognitoUser.updateAttributes(attributes, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}