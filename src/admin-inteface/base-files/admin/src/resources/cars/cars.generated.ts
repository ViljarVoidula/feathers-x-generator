import type * as Types from '../../types';

import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type CarFieldsFragment = { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: Types.OwnerOccupation | null } };

export type FindCarsQueryVariables = Types.Exact<{
  query?: Types.InputMaybe<Types.Scalars['JSONObject']>;
}>;


export type FindCarsQuery = { __typename?: 'Query', carsPage: { __typename?: 'CarsPage', total: number, skip: number, limit: number, data: Array<{ __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: Types.OwnerOccupation | null } } | null> } };

export type FindOneCarQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type FindOneCarQuery = { __typename?: 'Query', car?: { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: Types.OwnerOccupation | null } } | null };

export type CreateCarMutationVariables = Types.Exact<{
  data: Types.CreateCar;
}>;


export type CreateCarMutation = { __typename?: 'Mutation', createCar?: { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: Types.OwnerOccupation | null } } | null };

export type PatchCarMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  data: Types.PatchCar;
}>;


export type PatchCarMutation = { __typename?: 'Mutation', patchCar?: { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: Types.OwnerOccupation | null } } | null };

export const CarFieldsFragmentDoc = gql`
    fragment CarFields on Car {
  _id
  brand
  owner {
    name
    occupation
  }
}
    `;
export const FindCarsDocument = gql`
    query FindCars($query: JSONObject) {
  carsPage(query: $query) {
    total
    skip
    limit
    data {
      ...CarFields
    }
  }
}
    ${CarFieldsFragmentDoc}`;

export function useFindCarsQuery(options?: Omit<Urql.UseQueryArgs<FindCarsQueryVariables>, 'query'>) {
  return Urql.useQuery<FindCarsQuery, FindCarsQueryVariables>({ query: FindCarsDocument, ...options });
};
export const FindOneCarDocument = gql`
    query FindOneCar($id: String!) {
  car(id: $id) {
    ...CarFields
  }
}
    ${CarFieldsFragmentDoc}`;

export function useFindOneCarQuery(options: Omit<Urql.UseQueryArgs<FindOneCarQueryVariables>, 'query'>) {
  return Urql.useQuery<FindOneCarQuery, FindOneCarQueryVariables>({ query: FindOneCarDocument, ...options });
};
export const CreateCarDocument = gql`
    mutation CreateCar($data: CreateCar!) {
  createCar(data: $data) {
    ...CarFields
  }
}
    ${CarFieldsFragmentDoc}`;

export function useCreateCarMutation() {
  return Urql.useMutation<CreateCarMutation, CreateCarMutationVariables>(CreateCarDocument);
};
export const PatchCarDocument = gql`
    mutation PatchCar($id: ID!, $data: PatchCar!) {
  patchCar(id: $id, data: $data) {
    ...CarFields
  }
}
    ${CarFieldsFragmentDoc}`;

export function usePatchCarMutation() {
  return Urql.useMutation<PatchCarMutation, PatchCarMutationVariables>(PatchCarDocument);
};