import { jest, describe, it, expect, beforeEach, test } from '@jest/globals';

// Mock Clerk server auth API
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { checkRole } from '../../utils/roles';
import type { Roles } from '../../types/globals';

// Define only the shape we use from Clerk's auth return
type AuthReturn = { sessionClaims?: { metadata?: { role?: Roles } } };

const mockedAuth = auth as unknown as jest.MockedFunction<() => Promise<AuthReturn>>;

const ALL_ROLES: ReadonlyArray<Roles> = ['admin', 'member', 'client'] as const;

describe('utils/checkRole', () => {
  beforeEach(() => {
    mockedAuth.mockReset();
  });

  test.each(ALL_ROLES)(
    'returns true when Clerk session role matches requested role "%s"',
    async (role) => {
      mockedAuth.mockResolvedValue({ sessionClaims: { metadata: { role } } });

      await expect(checkRole(role)).resolves.toBe(true);
      expect(mockedAuth).toHaveBeenCalledTimes(1);
    }
  );

  it('returns false when Clerk session role differs from requested role', async () => {
    mockedAuth.mockResolvedValue({ sessionClaims: { metadata: { role: 'admin' } } });

    await expect(checkRole('member')).resolves.toBe(false);
    expect(mockedAuth).toHaveBeenCalledTimes(1);
  });

  it('returns false when sessionClaims are missing', async () => {
    mockedAuth.mockResolvedValue({});

    await expect(checkRole('admin')).resolves.toBe(false);
  });

  it('returns false when metadata is missing', async () => {
    mockedAuth.mockResolvedValue({ sessionClaims: {} });

    await expect(checkRole('admin')).resolves.toBe(false);
  });

  it('performs a case-sensitive comparison of roles', async () => {
    // Note: Returned role uses a different case and should not match
    mockedAuth.mockResolvedValue({ sessionClaims: { metadata: { role: 'Admin' as Roles } } });

    await expect(checkRole('admin')).resolves.toBe(false);
  });

  it('propagates errors thrown by auth()', async () => {
    const error = new Error('auth failed');
    mockedAuth.mockRejectedValue(error);

    await expect(checkRole('admin')).rejects.toThrow('auth failed');
  });
});
