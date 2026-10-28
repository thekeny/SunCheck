import { describe, it, expect, vi } from 'vitest';
import { CheckBlockedError, createCheck } from '../src/index';

type Move = { tasksDone: boolean; transport: string | null };
const checks = createCheck<Move>({
  tasks: { when: (c) => c.tasksDone, reason: 'Complete tasks' },
  transport: { when: (c) => Boolean(c.transport), reason: (c) => c.transport ? '' : 'Choose transport' },
});

describe('suncheck', () => {
  it('reports all failed conditions in order', () => {
    expect(checks.evaluate({ tasksDone: false, transport: null })).toEqual({
      ready: false,
      missing: ['Complete tasks', 'Choose transport'],
      failed: [{ key: 'tasks', reason: 'Complete tasks' }, { key: 'transport', reason: 'Choose transport' }],
    });
  });

  it('re-evaluates fresh context', () => {
    expect(checks.evaluate({ tasksDone: true, transport: 'Van' }).ready).toBe(true);
    expect(checks.evaluate({ tasksDone: false, transport: 'Van' }).ready).toBe(false);
  });

  it('runs only when all requirements pass', () => {
    const action = vi.fn(() => 42);
    expect(() => checks.run({ tasksDone: false, transport: null }, action)).toThrow(CheckBlockedError);
    expect(action).not.toHaveBeenCalled();
    expect(checks.run({ tasksDone: true, transport: 'Van' }, action)).toBe(42);
  });

  it('preserves original action errors', () => {
    const error = new Error('network');
    expect(() => checks.run({ tasksDone: true, transport: 'Van' }, () => { throw error; })).toThrow(error);
  });

  it('treats an empty requirement set as ready', () => {
    expect(createCheck<Record<string, never>>({}).evaluate({}).ready).toBe(true);
  });
});
