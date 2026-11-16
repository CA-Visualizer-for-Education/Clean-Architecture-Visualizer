import { describe, expect, it } from '@jest/globals';
import { UseCaseName } from '../../../src/entity/useCaseName.js';

describe('UseCaseName', () => {
  it.each([
    '../Login',
    'a/b',
    '..\\Login',
    '/Login',
    '1Login',
    'Login_name',
    '',
    '   ',
    'Log\tIn',
    'Login\n',
  ])('rejects invalid names (%j)', (name) => {
    expect(() => new UseCaseName(name)).toThrow(
      'use letters and digits, starting with a letter'
    );
  });

  it.each([
    ['Log In', 'LogIn'],
    [' Login 2 ', 'Login2'],
    ['a', 'a'],
    ['login123', 'login123'],
  ])('normalises %j to %j', (name, expected) => {
    expect(new UseCaseName(name).value).toBe(expected);
  });
});
