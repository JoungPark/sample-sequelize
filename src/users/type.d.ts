interface Authenticate {
  email: string;
  password: string;
  newPassword?: string;
}

interface AuthenticateResponse {
  token?: string;
  access?: string;
  refresh?: string;
  newPasswordRequired?: boolean;
}

interface User {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role: string;
  tier: string;
}

interface Customer {
  id?: string;
  name: string;
  sla: string;
}

export { Authenticate, User, Customer, AuthenticateResponse };