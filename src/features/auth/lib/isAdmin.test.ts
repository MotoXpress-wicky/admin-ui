import { describe, expect, it } from 'vitest';
import { isAdmin } from './isAdmin';

describe('isAdmin', () => {
  it('is true only when ROLE_ADMIN is among the roles', () => {
    expect(isAdmin({ roles: ['ROLE_DEFAULT', 'ROLE_ADMIN'] })).toBe(true);
    expect(isAdmin({ roles: ['ROLE_ADMIN'] })).toBe(true);
  });

  it('is false for a customer, and for a role name that only looks similar', () => {
    expect(isAdmin({ roles: ['ROLE_DEFAULT'] })).toBe(false);
    expect(isAdmin({ roles: ['ROLE_USER'] })).toBe(false);
    expect(isAdmin({ roles: ['ROLE_ADMINISTRATOR'] })).toBe(false);
    expect(isAdmin({ roles: ['admin'] })).toBe(false);
    expect(isAdmin({ roles: [] })).toBe(false);
  });

  it('is false when nobody is logged in', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
