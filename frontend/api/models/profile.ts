import { ResponseError } from "aws-sdk/clients/ec2";

export class PythonLogin {
    id?: string; 
  }


  export class LoginResponse {
    user?: PythonLogin;
    error?: ResponseError
  }



  export class UserProfile {
    id!: number;
  }


