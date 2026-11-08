import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

const serverModulePath = '../../../src/server/server.js';
const appBuilderModulePath = '../../../src/app/appBuilder.js';
const sessionDbAccessPath = '../../../src/data_access/sessionDBAccess.js';

let AppBuilder: typeof import('../../../src/app/appBuilder.js').AppBuilder;
let SessionDbAccess: typeof import('../../../src/data_access/sessionDBAccess.js').SessionDbAccess;
let mockStopServer: jest.Mock;

describe('AppBuilder runEndProject', () => {
  let appBuilder: InstanceType<typeof AppBuilder>;
  let mockDb: InstanceType<typeof SessionDbAccess>;

  beforeAll(async () => {
    jest.resetModules();

    jest.unstable_mockModule(serverModulePath, () => ({
      startServer: jest.fn(),
      stopServer: jest.fn(async () => undefined),
    }));

    const module = await import(appBuilderModulePath);
    AppBuilder = module.AppBuilder;

    const serverModule = await import(serverModulePath);
    mockStopServer = serverModule.stopServer as jest.Mock;

    const sessionDbModule = await import(sessionDbAccessPath);
    SessionDbAccess = sessionDbModule.SessionDbAccess;
  });

  beforeEach(() => {
    mockDb = new SessionDbAccess();
    jest.spyOn(mockDb, 'resetDb');
    appBuilder = new AppBuilder().withSessionDbAccess(mockDb);
    mockStopServer.mockReset();
  });

  it('resets the session database and closes the server', async () => {
    await appBuilder.runEndProject();

    expect(mockDb.resetDb).toHaveBeenCalledTimes(1);
    expect(mockStopServer).toHaveBeenCalledTimes(1);
  });

  it('actually clears stored session state when closing the server', async () => {
    const realDb = new SessionDbAccess();
    realDb.setProjectName('test-project');

    expect(realDb.getProjectName()).toBe('test-project');

    appBuilder = new AppBuilder().withSessionDbAccess(realDb);

    await appBuilder.runEndProject();

    expect(realDb.getProjectName()).toBe('');
    expect(mockStopServer).toHaveBeenCalledTimes(1);
  });

  it('waits for stopServer to complete before resolving', async () => {
    let stopServerCalled = false;
    mockStopServer.mockImplementation(async () => {
      stopServerCalled = true;
      return new Promise<void>((resolve) => setTimeout(resolve, 10));
    });

    const promise = appBuilder.runEndProject();
    expect(stopServerCalled).toBe(true);
    await promise;
  });
});

describe('Server lifecycle', () => {
  it('closes the running server when runEndProject is called', async () => {
    jest.resetModules();
    jest.unstable_unmockModule(serverModulePath);

    const { startServer } = await import(serverModulePath);
    const { AppBuilder } = await import(appBuilderModulePath);
    const { SessionDbAccess } = await import(sessionDbAccessPath);

    const db = new SessionDbAccess();
    const server = await startServer(true, db);
    const appBuilder = new AppBuilder().withSessionDbAccess(db);

    await appBuilder.runEndProject();

    expect(server.listening).toBe(false);
  });
});
