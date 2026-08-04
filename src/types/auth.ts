export interface CustomUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
  
  export interface CustomSession {
    user?: CustomUser;
    expires?: string;
  }