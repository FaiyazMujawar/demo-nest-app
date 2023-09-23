import { LoadUserMiddleware } from './loaduser.middleware';

describe('LoaduserMiddleware', () => {
  it('should be defined', () => {
    expect(new LoadUserMiddleware(null, null)).toBeDefined();
  });
});
