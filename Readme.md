# User Manager micro-service for DreamPay Prototype

## run on local

- install dependencies
  ```
  yarn
  ```

- run server
  ```
  yarn start
  ```

## API Methods

- Create User (Signup)
  ```
  POST /reg or /
  ```

- Authenticate (Signin)
  ```
  POST /auth
  ```

- Reset my password _(not implemented)_
  ```
  POST /password/reset
  ```

- Change my password _(not implemented)_
  ```
  POST /password/change
  ```

- Get my customer information
  ```
  GET  /customer
  ```

- Create a new customer
  ```
  POST /customer
  ```

- Get new tokens from refresh token
  ```
  GET /refreshtoken
  ```

## docker build and push to aws ecr

- build docker image
  ```
  docker build . -t $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com/drpproto-saas-user/service:latest
  or
  docker build . -t 406353380800.dkr.ecr.ap-southeast-2.amazonaws.com/drpproto-saas-user/service:latest
  ```

- puch docker image to aws-ecr
  ```
  docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com/drpproto-saas-user/service:latest
  or
  docker push 406353380800.dkr.ecr.ap-southeast-2.amazonaws.com/drpproto-saas-user/service:latest
  ```

- ecs update-service
  ```
  aws ecs update-service --cluster drpproto-saas-user-cluster --service drpproto-saas-user-ecs-Service9571FDD8-1HHM4UNU5YGK2 --force-new-deployment
  ```

### useful docker / aws command

- aws ecr login

  ```
  $(aws ecr get-login --no-include-email)
  ```
  `aws ecr get-login` is deprecated, use `aws ecr get-login-password`.

  ```
  docker login -u AWS --password $(aws ecr get-login-password --region ap-southeast-2) https://$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com
  ```
  Using `--password` via the CLI is insecure. Use `--password-stdin`

  So finally, the recommended command line on *PowerShell* is below:
  ```
  $(aws ecr get-login-password --region ap-southeast-2) | docker login -u AWS --password-stdin https://$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com
  ```
  On *Git Bash*
  ```
  aws ecr get-login-password --region ap-southeast-2 | docker login -u AWS --password-stdin https://$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com
  ```

- delete docker images
  ```
  docker image prune -a
  ```

- let the new revision of the task started
  ```
  docker run -p 8080:8080 $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com/drpproto-saas-user/service:latest
  or
  docker run -p 8080:8080 406353380800.dkr.ecr.ap-southeast-2.amazonaws.com/drpproto-saas-user/service:latest
  ```

- show a newly pushed docker image stored inside the ECR repository
  ```
  aws ecr describe-images --repository-name drpproto-saas-user/service
  ```