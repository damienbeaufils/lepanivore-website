import { isEmpty } from 'lodash';

export interface User {
  username: string;
}

export const ADMIN: User = { username: 'ADMIN' };
export const ANONYMOUS: User = { username: 'ANONYMOUS' };

export const isAdmin = (user: User): boolean => {
  return !isEmpty(user) && user.username === ADMIN.username;
};
