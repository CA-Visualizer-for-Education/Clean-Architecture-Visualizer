import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { AddressInfo } from 'net';
import { SessionDBAccess } from '../../../src/data_access/sessionDBAccess.js';
import { useCaseGraph } from '../../../src/entity/useCaseGraph.js';
import { startServer, stopServer } from '../../../src/server/server.js';

describe('analysis routes', () => {
  let db: SessionDBAccess;
  let baseUrl: string;

  beforeEach(async () => {
    db = new SessionDBAccess();
    db.resetDB();

    const server = await startServer(true, db);
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://localhost:${port}/api`;
  });

  afterEach(async () => {
    await stopServer();
    db.resetDB();
  });

  it('serves data written to the session DB after the server started', async () => {
    // Mirrors `cave start`: graph verification fills the DB after the routes exist.
    const graph = new useCaseGraph('login');
    graph.setViolation(['view', 'controller']);
    db.setProjectName('csc207-project');
    db.setNumUseCases(1);
    db.setNumViolations(1);
    db.setUseCases([graph], []);

    const res = await fetch(`${baseUrl}/analysis/summary`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      project_name: 'csc207-project',
      total_use_cases: 1,
      total_violations: 1,
      use_cases: [
        {
          id: 'uc-0',
          name: 'login',
          violation_count: 1,
          interactions: [{ interaction_id: 'uc-0', interaction_name: 'login' }],
        },
      ],
    });
  });
});
