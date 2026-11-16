import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { resolveProjectRoot, runEngine } from '../src/runner';

describe('resolveProjectRoot', () => {
  const ws = path.resolve('/ws');

  it('defaults to the workspace folder', () => {
    expect(resolveProjectRoot(ws, undefined)).toBe(ws);
    expect(resolveProjectRoot(ws, '   ')).toBe(ws);
  });

  it('resolves a relative setting against the workspace folder', () => {
    expect(resolveProjectRoot(ws, 'project')).toBe(path.join(ws, 'project'));
  });

  it('keeps an absolute setting', () => {
    const abs = path.resolve('/elsewhere/project');
    expect(resolveProjectRoot(ws, abs)).toBe(abs);
  });
});

describe('runEngine', () => {
  let dir: string;
  let fakeEngine: string;

  beforeAll(() => {
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'cave-')));
    fakeEngine = path.join(dir, 'fake-engine.js');
    // Echoes its args and cwd on stdout, and logs noise on stderr.
    fs.writeFileSync(
      fakeEngine,
      `console.error('Directory views not found');
       process.stdout.write(JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }));`
    );
  });

  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('runs `verify --json` with cwd set to the project root', async () => {
    const result = await runEngine({
      enginePath: fakeEngine,
      projectRoot: dir,
    });
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      args: ['verify', '--json'],
      cwd: dir,
    });
    expect(result.stderr).toContain('Directory views not found');
  });

  it('reports a non-zero exit code', async () => {
    const failing = path.join(dir, 'failing.js');
    fs.writeFileSync(failing, 'process.exit(3);');
    const result = await runEngine({ enginePath: failing, projectRoot: dir });
    expect(result.exitCode).toBe(3);
  });

  it('rejects on timeout', async () => {
    const slow = path.join(dir, 'slow.js');
    fs.writeFileSync(slow, 'setTimeout(() => {}, 10000);');
    await expect(
      runEngine({ enginePath: slow, projectRoot: dir, timeoutMs: 200 })
    ).rejects.toThrow('timed out');
  });
});
