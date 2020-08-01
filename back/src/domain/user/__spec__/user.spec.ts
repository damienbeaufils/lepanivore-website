import { ADMIN, ANONYMOUS, isAdmin, User } from '../user';

describe('domain/user', () => {
  describe('ADMIN', () => {
    it('should be a user having the username ADMIN', () => {
      // when
      const result: string = ADMIN.username;

      // then
      expect(result).toBe('ADMIN');
    });
  });

  describe('ANONYMOUS', () => {
    it('should be a user having the username ANONYMOUS', () => {
      // when
      const result: string = ANONYMOUS.username;

      // then
      expect(result).toBe('ANONYMOUS');
    });
  });

  describe('isAdmin()', () => {
    it('should return true when username is ADMIN', () => {
      // given
      const user: User = ADMIN;

      // when
      const result: boolean = isAdmin(user);

      // then
      expect(result).toBe(true);
    });

    it('should return false when username is not ADMIN', () => {
      // given
      const user: User = ANONYMOUS;

      // when
      const result: boolean = isAdmin(user);

      // then
      expect(result).toBe(false);
    });

    it('should return false when user is null', () => {
      // given
      const user: User = null;

      // when
      const result: boolean = isAdmin(user);

      // then
      expect(result).toBe(false);
    });

    it('should return false when user is undefined', () => {
      // given
      const user: User = undefined;

      // when
      const result: boolean = isAdmin(user);

      // then
      expect(result).toBe(false);
    });
  });
});
