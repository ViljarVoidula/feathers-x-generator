export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSONObject: any;
};

export type AuthNData = {
  __typename?: 'AuthNData';
  payload: AuthNPayload;
  strategy: Scalars['String'];
};

export type AuthNPayload = {
  __typename?: 'AuthNPayload';
  aud: Scalars['String'];
  exp: Scalars['Int'];
  iat: Scalars['Int'];
  jti: Scalars['String'];
  sub: Scalars['String'];
};

export type AuthNResult = {
  __typename?: 'AuthNResult';
  accessToken: Scalars['String'];
  authentication: AuthNData;
  user: AuthNUser;
};

export type AuthNUser = {
  __typename?: 'AuthNUser';
  email: Scalars['String'];
  id: Scalars['ID'];
};

export type Car = {
  __typename?: 'Car';
  _id: Scalars['String'];
  brand: Scalars['String'];
  created_at: Scalars['String'];
  deleted_at?: Maybe<Scalars['String']>;
  /** Owner */
  owner: Owner;
  /** Reference to the owners table PK */
  owner_id: Scalars['String'];
  updated_at: Scalars['String'];
};

export type CarsPage = {
  __typename?: 'CarsPage';
  data: Array<Maybe<Car>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type CreateCar = {
  brand: Scalars['String'];
  owner_id: Scalars['String'];
};

export type CreateOwner = {
  name: Scalars['String'];
  occupation?: InputMaybe<OwnerOccupation>;
};

export type CreateSchedule = {
  base_schedule?: InputMaybe<Scalars['String']>;
  employees: Array<ScheduleEmployeesInput>;
  end_date?: InputMaybe<Scalars['String']>;
  objective: Scalars['String'];
  organization_id?: InputMaybe<Scalars['String']>;
  shift_assignments?: InputMaybe<Array<ScheduleShiftAssignmentsInput>>;
  shifts: Array<ScheduleShiftsInput>;
  start_date?: InputMaybe<Scalars['String']>;
  swap_requests: Array<Scalars['JSONObject']>;
};

export type CreateTimetable = {
  author?: InputMaybe<Scalars['String']>;
  patches?: InputMaybe<Array<Scalars['String']>>;
  schedule_id: Scalars['String'];
  timetable: Array<TimetableTimetableInput>;
};

export type CreateUser = {
  customer_id?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  firstname?: InputMaybe<Scalars['String']>;
  isVerified: Scalars['Boolean'];
  lastname?: InputMaybe<Scalars['String']>;
  organizations?: InputMaybe<Array<Scalars['String']>>;
  password?: InputMaybe<Scalars['String']>;
  resetAttempts: Scalars['Float'];
  resetExpires: Scalars['String'];
  resetToken: Scalars['String'];
  subscription_id?: InputMaybe<Scalars['String']>;
  verifyChanges?: InputMaybe<UserVerifyChangesInput>;
  verifyExpires: Scalars['Float'];
  verifyShortToken: Scalars['String'];
  verifyToken?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  authenticate: AuthNResult;
  createCar?: Maybe<Car>;
  createOwner?: Maybe<Owner>;
  createSchedule?: Maybe<Schedule>;
  createTimetable?: Maybe<Timetable>;
  createUser?: Maybe<User>;
  patchCar?: Maybe<Car>;
  patchOwner?: Maybe<Owner>;
  patchSchedule?: Maybe<Schedule>;
  patchTimetable?: Maybe<Timetable>;
  patchUser?: Maybe<User>;
  removeCar?: Maybe<Car>;
  removeOwner?: Maybe<Owner>;
  removeSchedule?: Maybe<Schedule>;
};


export type MutationAuthenticateArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  strategy: Scalars['String'];
};


export type MutationCreateCarArgs = {
  data: CreateCar;
};


export type MutationCreateOwnerArgs = {
  data: CreateOwner;
};


export type MutationCreateScheduleArgs = {
  data: CreateSchedule;
};


export type MutationCreateTimetableArgs = {
  data: CreateTimetable;
};


export type MutationCreateUserArgs = {
  data: CreateUser;
};


export type MutationPatchCarArgs = {
  data: PatchCar;
  id: Scalars['ID'];
};


export type MutationPatchOwnerArgs = {
  data: PatchOwner;
  id: Scalars['ID'];
};


export type MutationPatchScheduleArgs = {
  data: PatchSchedule;
  id: Scalars['ID'];
};


export type MutationPatchTimetableArgs = {
  data: PatchTimetable;
  id: Scalars['ID'];
};


export type MutationPatchUserArgs = {
  data: PatchUser;
  id: Scalars['ID'];
};


export type MutationRemoveCarArgs = {
  id: Scalars['ID'];
};


export type MutationRemoveOwnerArgs = {
  id: Scalars['ID'];
};


export type MutationRemoveScheduleArgs = {
  id: Scalars['ID'];
};

export type Owner = {
  __typename?: 'Owner';
  _id: Scalars['String'];
  created_at: Scalars['String'];
  deleted_at?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  occupation?: Maybe<OwnerOccupation>;
  updated_at: Scalars['String'];
};

export const OwnerOccupation = {
  Other: 'other',
  Student: 'student',
  Teacher: 'teacher'
} as const;

export type OwnerOccupation = typeof OwnerOccupation[keyof typeof OwnerOccupation];
export type OwnersPage = {
  __typename?: 'OwnersPage';
  data: Array<Maybe<Owner>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type PatchCar = {
  brand: Scalars['String'];
  owner_id: Scalars['String'];
};

export type PatchOwner = {
  name: Scalars['String'];
  occupation?: InputMaybe<OwnerOccupation>;
};

export type PatchSchedule = {
  base_schedule?: InputMaybe<Scalars['String']>;
  employees: Array<ScheduleEmployeesInput>;
  end_date?: InputMaybe<Scalars['String']>;
  objective: Scalars['String'];
  organization_id?: InputMaybe<Scalars['String']>;
  owner?: InputMaybe<Scalars['String']>;
  shift_assignments?: InputMaybe<Array<ScheduleShiftAssignmentsInput>>;
  shifts: Array<ScheduleShiftsInput>;
  start_date?: InputMaybe<Scalars['String']>;
  swap_requests: Array<Scalars['JSONObject']>;
};

export type PatchTimetable = {
  author?: InputMaybe<Scalars['String']>;
  patches?: InputMaybe<Array<Scalars['String']>>;
  schedule_id: Scalars['String'];
  timetable: Array<TimetableTimetableInput>;
};

export type PatchUser = {
  customer_id?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  firstname?: InputMaybe<Scalars['String']>;
  isVerified: Scalars['Boolean'];
  lastname?: InputMaybe<Scalars['String']>;
  organizations?: InputMaybe<Array<Scalars['String']>>;
  password?: InputMaybe<Scalars['String']>;
  resetAttempts: Scalars['Float'];
  resetExpires: Scalars['String'];
  resetToken: Scalars['String'];
  subscription_id?: InputMaybe<Scalars['String']>;
  verifyChanges?: InputMaybe<UserVerifyChangesInput>;
  verifyExpires: Scalars['Float'];
  verifyShortToken: Scalars['String'];
  verifyToken?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  car?: Maybe<Car>;
  carsPage: CarsPage;
  owner?: Maybe<Owner>;
  ownersPage: OwnersPage;
  schedule?: Maybe<Schedule>;
  schedulesPage: SchedulesPage;
  timetable?: Maybe<Timetable>;
  timetablesPage: TimetablesPage;
  user?: Maybe<User>;
  usersPage: UsersPage;
};


export type QueryCarArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryCarsPageArgs = {
  query?: InputMaybe<Scalars['JSONObject']>;
};


export type QueryOwnerArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryOwnersPageArgs = {
  query?: InputMaybe<Scalars['JSONObject']>;
};


export type QueryScheduleArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QuerySchedulesPageArgs = {
  query?: InputMaybe<Scalars['JSONObject']>;
};


export type QueryTimetableArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryTimetablesPageArgs = {
  query?: InputMaybe<Scalars['JSONObject']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryUsersPageArgs = {
  query?: InputMaybe<Scalars['JSONObject']>;
};

export type RemoveCar = {
  id: Scalars['ID'];
};

export type RemoveOwner = {
  id: Scalars['ID'];
};

export type RemoveSchedule = {
  id: Scalars['ID'];
};

export type Schedule = {
  __typename?: 'Schedule';
  _id: Scalars['String'];
  base_schedule?: Maybe<Scalars['String']>;
  created_at: Scalars['String'];
  deleted_at?: Maybe<Scalars['String']>;
  employees: Array<ScheduleEmployees>;
  end_date?: Maybe<Scalars['String']>;
  objective: Scalars['String'];
  organization_id?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  shift_assignments?: Maybe<Array<ScheduleShiftAssignments>>;
  /** Shifts for the schedule */
  shifts: Array<ScheduleShifts>;
  start_date?: Maybe<Scalars['String']>;
  swap_requests: Array<Scalars['JSONObject']>;
  timetables: Array<Timetable>;
  updated_at: Scalars['String'];
};


export type ScheduleTimetablesArgs = {
  query?: InputMaybe<Scalars['JSONObject']>;
};

export type ScheduleEmployees = {
  __typename?: 'ScheduleEmployees';
  alias: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  max_hours_for_period: Scalars['Float'];
  max_shift_duration: Scalars['Float'];
  min_hours_for_period: Scalars['Float'];
  tags: Array<Scalars['String']>;
  time_off: Array<Scalars['JSONObject']>;
  uuid: Scalars['String'];
};

export type ScheduleEmployeesInput = {
  alias: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
  max_hours_for_period: Scalars['Float'];
  max_shift_duration: Scalars['Float'];
  min_hours_for_period: Scalars['Float'];
  tags: Array<Scalars['String']>;
  time_off: Array<Scalars['JSONObject']>;
  uuid: Scalars['String'];
};

export type ScheduleShiftAssignments = {
  __typename?: 'ScheduleShiftAssignments';
  create_policy: ScheduleShiftAssignmentsCreatePolicy;
  day: Scalars['String'];
  end_time: Scalars['String'];
  shift: Scalars['String'];
  start_time: Scalars['String'];
  tag_requirements: Scalars['JSONObject'];
  uuid: Scalars['String'];
};

export const ScheduleShiftAssignmentsCreatePolicy = {
  JustInTime: 'just_in_time',
  OnScheduleCreate: 'on_schedule_create'
} as const;

export type ScheduleShiftAssignmentsCreatePolicy = typeof ScheduleShiftAssignmentsCreatePolicy[keyof typeof ScheduleShiftAssignmentsCreatePolicy];
export type ScheduleShiftAssignmentsInput = {
  create_policy: ScheduleShiftAssignmentsCreatePolicy;
  day: Scalars['String'];
  end_time: Scalars['String'];
  shift: Scalars['String'];
  start_time: Scalars['String'];
  tag_requirements: Scalars['JSONObject'];
  uuid: Scalars['String'];
};

export type ScheduleShifts = {
  __typename?: 'ScheduleShifts';
  day: Scalars['String'];
  end_time: Scalars['String'];
  min_employees: Scalars['Float'];
  shift: Scalars['String'];
  start_time: Scalars['String'];
  tag_requirements: Scalars['JSONObject'];
};

export type ScheduleShiftsInput = {
  day: Scalars['String'];
  end_time: Scalars['String'];
  min_employees: Scalars['Float'];
  shift: Scalars['String'];
  start_time: Scalars['String'];
  tag_requirements: Scalars['JSONObject'];
};

export type SchedulesPage = {
  __typename?: 'SchedulesPage';
  data: Array<Maybe<Schedule>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type Timetable = {
  __typename?: 'Timetable';
  _id: Scalars['String'];
  author?: Maybe<Scalars['String']>;
  created_at: Scalars['String'];
  deleted_at?: Maybe<Scalars['String']>;
  patches?: Maybe<Array<Scalars['String']>>;
  /** Schedules */
  schedule: Timetable;
  schedule_id: Scalars['String'];
  timetable: Array<TimetableTimetable>;
  updated_at: Scalars['String'];
};

export type TimetableTimetable = {
  __typename?: 'TimetableTimetable';
  date: Scalars['String'];
  employee: Scalars['String'];
  shift: Scalars['String'];
};

export type TimetableTimetableInput = {
  date: Scalars['String'];
  employee: Scalars['String'];
  shift: Scalars['String'];
};

export type TimetablesPage = {
  __typename?: 'TimetablesPage';
  data: Array<Maybe<Timetable>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String'];
  customer_id?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstname?: Maybe<Scalars['String']>;
  isVerified: Scalars['Boolean'];
  lastname?: Maybe<Scalars['String']>;
  organizations?: Maybe<Array<Scalars['String']>>;
  password?: Maybe<Scalars['String']>;
  resetAttempts: Scalars['Float'];
  resetExpires: Scalars['String'];
  resetToken: Scalars['String'];
  subscription_id?: Maybe<Scalars['String']>;
  verifyChanges?: Maybe<UserVerifyChanges>;
  verifyExpires: Scalars['Float'];
  verifyShortToken: Scalars['String'];
  verifyToken?: Maybe<Scalars['String']>;
};

export type UserVerifyChanges = {
  __typename?: 'UserVerifyChanges';
  _empty?: Maybe<Scalars['String']>;
};

export type UserVerifyChangesInput = {
  _empty?: InputMaybe<Scalars['String']>;
};

export type UsersPage = {
  __typename?: 'UsersPage';
  data: Array<Maybe<User>>;
  limit: Scalars['Int'];
  skip: Scalars['Int'];
  total: Scalars['Int'];
};

export type AuthenticateMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type AuthenticateMutation = { __typename?: 'Mutation', authenticate: { __typename?: 'AuthNResult', accessToken: string, user: { __typename?: 'AuthNUser', email: string } } };

export type CarFieldsFragment = { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: OwnerOccupation | null } };

export type FindCarsQueryVariables = Exact<{
  query?: InputMaybe<Scalars['JSONObject']>;
}>;


export type FindCarsQuery = { __typename?: 'Query', carsPage: { __typename?: 'CarsPage', total: number, skip: number, limit: number, data: Array<{ __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: OwnerOccupation | null } } | null> } };

export type FindOneCarQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCarQuery = { __typename?: 'Query', car?: { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: OwnerOccupation | null } } | null };

export type CreateCarMutationVariables = Exact<{
  data: CreateCar;
}>;


export type CreateCarMutation = { __typename?: 'Mutation', createCar?: { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: OwnerOccupation | null } } | null };

export type PatchCarMutationVariables = Exact<{
  id: Scalars['ID'];
  data: PatchCar;
}>;


export type PatchCarMutation = { __typename?: 'Mutation', patchCar?: { __typename?: 'Car', _id: string, brand: string, owner: { __typename?: 'Owner', name: string, occupation?: OwnerOccupation | null } } | null };

export type UserFieldsFragment = { __typename?: 'User', _id: string, email: string, lastname?: string | null, firstname?: string | null };

export type FindUsersQueryVariables = Exact<{
  query?: InputMaybe<Scalars['JSONObject']>;
}>;


export type FindUsersQuery = { __typename?: 'Query', usersPage: { __typename?: 'UsersPage', total: number, data: Array<{ __typename?: 'User', _id: string, email: string, lastname?: string | null, firstname?: string | null } | null> } };

export type FindOneUserQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', _id: string, email: string, lastname?: string | null, firstname?: string | null } | null };

export type CeateUserMutationVariables = Exact<{
  data: CreateUser;
}>;


export type CeateUserMutation = { __typename?: 'Mutation', createUser?: { __typename?: 'User', _id: string, email: string, lastname?: string | null, firstname?: string | null } | null };

export type PatchUserMutationVariables = Exact<{
  id: Scalars['ID'];
  data: PatchUser;
}>;


export type PatchUserMutation = { __typename?: 'Mutation', patchUser?: { __typename?: 'User', _id: string, email: string, lastname?: string | null, firstname?: string | null } | null };
