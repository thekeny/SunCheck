/** A single, explainable requirement for an action. */
export type Requirement<Context> = {
  when: (context: Context) => boolean;
  reason: string | ((context: Context) => string);
};

export type Requirements<Context> = Record<string, Requirement<Context>>;

export type CheckResult<Key extends string = string> = {
  readonly ready: boolean;
  readonly missing: readonly string[];
  readonly failed: readonly { key: Key; reason: string }[];
};

export class CheckBlockedError<Key extends string = string> extends Error {
  readonly result: CheckResult<Key>;

  constructor(result: CheckResult<Key>) {
    super(result.missing.join('; ') || 'Action is blocked');
    this.name = 'CheckBlockedError';
    this.result = result;
  }
}

/**
 * Define reusable conditions. The caller supplies fresh context on evaluation.
 * Evaluation is synchronous and does not cache results.
 */
export function createCheck<Context, const Rules extends Requirements<Context> = Requirements<Context>>(
  rules: Rules,
) {
  type Key = Extract<keyof Rules, string>;

  function evaluate(context: Context): CheckResult<Key> {
    const failed: { key: Key; reason: string }[] = [];

    for (const key of Object.keys(rules) as Key[]) {
      const rule = rules[key];
      if (!rule.when(context)) {
        failed.push({
          key,
          reason: typeof rule.reason === 'function' ? rule.reason(context) : rule.reason,
        });
      }
    }

    return {
      ready: failed.length === 0,
      missing: failed.map((item) => item.reason),
      failed,
    };
  }

  function run<Result>(context: Context, action: () => Result): Result {
    const result = evaluate(context);
    if (!result.ready) throw new CheckBlockedError(result);
    return action();
  }

  return { evaluate, run } as const;
}
