export class User {
  id!: number;
  username!: string;
}


export class LoginResponse {
  user!: User;
}



export interface UserModel {
  id: number;
  username: string;
  role: string;
}


export interface LoginCookieData {
  username: string;
  id: number;
  role: string;
  createdAt: number;
  updatedAt: number;
  }


  export enum RoleType {
    Undefined,
    Applicant,
    Reviewer,
    Manager,
    Auditor,
    Admin
  }
  
  type userLogin = {
    username: string;
    password: string;
  };
  
  type userRegister = {
    username: string;
    password: string;
    role: string;
  };
  
  type User1 ={
    user_id: number; // SQLite uses INTEGER for auto-increment primary keys
    username: string; // Assuming email should be unique
    user_password: string;
    user_role: string;
    createdAt: number; // Using integer for Unix timestamp
    updatedAt: number;
  }
  
  type ReadUserType = {
    id: number; // SQLite uses INTEGER for auto-increment primary keys
    username: string; // Assuming email should be unique
    password: string;
    user_role: string;
    createdAt: number; // Using integer for Unix timestamp
    updatedAt: number;
  }
  
  
  
  export type { userLogin,ReadUserType, userRegister, User1 };
  
  

