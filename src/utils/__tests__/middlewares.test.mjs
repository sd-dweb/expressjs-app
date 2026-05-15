import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { resolveIndexById } from '../middlewares.mjs';

describe('resolveIndexById', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('should set findUserIndex and call next when valid ID exists', () => {
    req.params.id = '1';

    resolveIndexById(req, res, next);

    expect(req.findUserIndex).toBe(0); // User with id 1 is at index 0
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  test('should find correct index for user with id 2', () => {
    req.params.id = '2';

    resolveIndexById(req, res, next);

    expect(req.findUserIndex).toBe(1); // User with id 2 is at index 1
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should find correct index for user with id 3', () => {
    req.params.id = '3';

    resolveIndexById(req, res, next);

    expect(req.findUserIndex).toBe(2); // User with id 3 is at index 2
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should find correct index for last user (id 4)', () => {
    req.params.id = '4';

    resolveIndexById(req, res, next);

    expect(req.findUserIndex).toBe(3); // User with id 4 is at index 3
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 404 when user ID does not exist', () => {
    req.params.id = '999';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ msg: 'User not found!' });
    expect(next).not.toHaveBeenCalled();
    expect(req.findUserIndex).toBeUndefined();
  });

  test('should return 404 when user ID is 0', () => {
    req.params.id = '0';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ msg: 'User not found!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 404 for negative ID that does not exist', () => {
    req.params.id = '-1';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ msg: 'User not found!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 400 when ID is not a valid number', () => {
    req.params.id = 'abc';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ msg: 'Bad request. Invalid ID!' });
    expect(next).not.toHaveBeenCalled();
    expect(req.findUserIndex).toBeUndefined();
  });

  test('should parse numeric prefix when ID contains letters and numbers', () => {
    req.params.id = '123abc';

    resolveIndexById(req, res, next);

    // parseInt('123abc') returns 123, which doesn't exist in our mock data
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ msg: 'User not found!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 400 when ID is empty string', () => {
    req.params.id = '';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ msg: 'Bad request. Invalid ID!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 400 when ID contains special characters', () => {
    req.params.id = '@#$%';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ msg: 'Bad request. Invalid ID!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 400 when ID is a decimal number', () => {
    req.params.id = '1.5';

    resolveIndexById(req, res, next);

    // parseInt('1.5') returns 1, which is valid, so this should succeed
    expect(req.findUserIndex).toBe(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should handle whitespace in ID by treating it as invalid', () => {
    req.params.id = '  ';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ msg: 'Bad request. Invalid ID!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 404 for very large ID number', () => {
    req.params.id = '999999999';

    resolveIndexById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ msg: 'User not found!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should not modify req or res when user is found', () => {
    req.params.id = '1';
    const originalReq = { ...req };

    resolveIndexById(req, res, next);

    // Should only add findUserIndex property
    expect(Object.keys(req).sort()).toEqual(['findUserIndex', 'params'].sort());
    expect(req.params).toBe(originalReq.params);
  });
});



