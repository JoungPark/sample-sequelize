import AWS from 'aws-sdk';

export default class CognitoPromiseProvider {
  cognitoidentityserviceprovider: AWS.CognitoIdentityServiceProvider;

  constructor(options: AWS.CognitoIdentityServiceProvider.ClientConfiguration) {
    this.cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(options);
  }

  adminCreateUser = (params: AWS.CognitoIdentityServiceProvider.AdminCreateUserRequest)
    : Promise<AWS.CognitoIdentityServiceProvider.AdminCreateUserResponse> => new Promise((resolve, reject) => {
    this.cognitoidentityserviceprovider.adminCreateUser(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  });

  adminGetUser = (params: AWS.CognitoIdentityServiceProvider.AdminGetUserRequest)
    : Promise<AWS.CognitoIdentityServiceProvider.AdminGetUserResponse> => new Promise((resolve, reject) => {
    this.cognitoidentityserviceprovider.adminGetUser(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });

  adminUpdateUserAttributes = (params: AWS.CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest)
    : Promise<AWS.CognitoIdentityServiceProvider.AdminUpdateUserAttributesResponse> => new Promise((resolve, reject) => {
    this.cognitoidentityserviceprovider.adminUpdateUserAttributes(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}