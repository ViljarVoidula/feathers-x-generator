import type * as Types from '../types';

import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type AuthenticateMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
}>;


export type AuthenticateMutation = { __typename?: 'Mutation', authenticate: { __typename?: 'AuthNResult', accessToken: string, user: { __typename?: 'AuthNUser', email: string } } };


export const AuthenticateDocument = gql`
    mutation Authenticate($email: String!, $password: String!) {
  authenticate(email: $email, password: $password, strategy: "local") {
    accessToken
    user {
      email
    }
  }
}
    `;

export function useAuthenticateMutation() {
  return Urql.useMutation<AuthenticateMutation, AuthenticateMutationVariables>(AuthenticateDocument);
};