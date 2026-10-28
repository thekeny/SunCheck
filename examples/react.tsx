// Example only. React is intentionally not a dependency of suncheck.
import { useState } from 'react';
import { createCheck } from 'suncheck';

type Move = { tasksDone: boolean; hasTransport: boolean };
const canFinish = createCheck<Move>({
  tasks: { when: (s) => s.tasksDone, reason: 'Complete all moving tasks' },
  transport: { when: (s) => s.hasTransport, reason: 'Choose transport' },
});

export function FinishMoving() {
  const [state, setState] = useState<Move>({ tasksDone: false, hasTransport: false });
  const result = canFinish.evaluate(state);

  return (
    <section>
      <label><input type="checkbox" checked={state.tasksDone} onChange={(e) => setState((s) => ({ ...s, tasksDone: e.target.checked }))} /> Tasks completed</label>
      <label><input type="checkbox" checked={state.hasTransport} onChange={(e) => setState((s) => ({ ...s, hasTransport: e.target.checked }))} /> Transport selected</label>
      <button disabled={!result.ready} onClick={() => canFinish.run(state, () => alert('Finished!'))}>Finish moving</button>
      {!result.ready && <ul>{result.failed.map((item) => <li key={item.key}>{item.reason}</li>)}</ul>}
    </section>
  );
}
