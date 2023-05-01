import { AuthBindings } from "@refinedev/core";
import client, { instance } from "dataproviders/graphql/client";
import { AuthenticateDocument } from './authentication/authentication.generated';
export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthBindings = {
  login: async ({ username, email, password }) => {
    if ((username || email) && password) {
      const { data: {authenticate: { accessToken }}, error } = await client.mutation(AuthenticateDocument, {
        email,
        password
      })
      if(error) {
        throw new Error(error.message)
      }

      localStorage.setItem('token', accessToken);
      
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem('token');
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem('token') || '';
    instance.setAccessToken(token)
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  // to be implemented
  getPermissions: async () => null,
  getIdentity: async () => {
    // improve to decode from jwt or set after authentication
    const token = localStorage.getItem('token') || '';
    if (token) {
      return {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
