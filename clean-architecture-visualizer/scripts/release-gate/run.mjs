import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    samples: { type: 'string' },
  },
});
const samplesDirectory = values.samples;
const testcasesDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'testcases'
);
const testcases = readdirSync(testcasesDirectory)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    name: file.replace('.json', ''),
    ...JSON.parse(readFileSync(path.join(testcasesDirectory, file)), 'utf8'),
  }));

//Runs one testcase. Return a list of all problems encountered. Emptylist if testcase passes
function verify(testcase) {
  const problems = [];
  const result = spawnSync('cave', testcase.args, {
    cwd: path.join(samplesDirectory, testcase.root),
    encoding: 'utf8',
  });

  if (result.error) {
    problems.push(`cave run error: ${result.error.message}`);
    return { problems, output: '' };
  }

  for (const match of testcase.mustMatch ?? []) {
    if (!new RegExp(match.pattern, 'm').test(result.stdout)) {
      problems.push(match.message);
    }
  }
  for (const match of testcase.notMatch ?? []) {
    if (new RegExp(match.pattern, 'm').test(result.stdout)) {
      problems.push(match.message);
    }
  }

  return { problems, output: result.stdout };
}

let failCount = 0;

for (const testcase of testcases) {
  const { problems, output } = verify(testcase);
  if (problems.length === 0) {
    console.log(`PASS: ${testcase.name}`);
    console.log(testcase.success);
  } else {
    console.log(`FAIL: ${testcase.name}`);
    failCount++;
    for (const problem of problems) console.log(` - ${problem}`);
    console.log(`cave output: ${output}`);
  }
}

process.exit(failCount > 0 ? 1 : 0);
