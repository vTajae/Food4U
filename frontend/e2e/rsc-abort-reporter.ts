import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export default class RscAbortReporter implements Reporter {
  private events: { project: string; test: string; retry: number; testStatus: string; guardControl: boolean; description?: string }[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    for (const annotation of result.annotations.filter(item => item.type === 'tolerated-rsc-abort')) {
      this.events.push({ project: test.parent.project()!.name, test: test.title, retry: result.retry,
        testStatus: result.status, guardControl: test.title.startsWith('RSC guard '), description: annotation.description });
    }
  }

  async onEnd(result: FullResult) {
    const path = resolve('e2e/.artifacts/019-rsc-aborts.json');
    await mkdir(resolve('e2e/.artifacts'), { recursive: true });
    await writeFile(path, JSON.stringify({ status: result.status, tolerated_rsc_abort_count: this.events.length,
      guard_control_count: this.events.filter(event => event.guardControl).length,
      application_count: this.events.filter(event => !event.guardControl).length, events: this.events }, null, 2));
  }
}
