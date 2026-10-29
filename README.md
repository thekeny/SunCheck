<img src="images/logo.png" style="width: 500px">

# SunCheck

[![Give a star](https://img.shields.io/github/stars/thekeny/suncheck?style=for-the-badge&logo=github&label=Give%20a%20star)](https://github.com/thekeny/suncheck)
[![npm](https://img.shields.io/npm/v/suncheck?style=for-the-badge&logo=npm&label=npm&color=CB3837)](https://www.npmjs.com/package/suncheck)

**Make disabled actions explain themselves**

Somewhere out there is a lightbulb that could fix everything. SunCheck tells the user where it is

A tiny, framework-agnostic TypeScript helper for checking whether an action is ready and telling the user exactly what is still missing. No runtime dependencies, no state management, no fetch wrapper — just a clear answer to the only question that matters when a button will not work: *what is still dark?*

## The idea

A disabled button is a room without a sun: the action is there, the world is there, but nobody can see why it stays dark. SunCheck turns every blocked action into an ordered list of missing pieces, so the player never has to guess <img src="images/niko_wow.webp" height="20" alt="Niko Wow">

Every blocked action gets one shot to explain itself. Use it well <img src="images/niko_heart.png" height="20" alt="Niko Heart">

## Installation

```bash
npm install suncheck
```

## Example

```ts
import { createCheck } from 'suncheck';

type Journey = { hasBulb: boolean; towerOpen: boolean };

const canRestoreSun = createCheck<Journey>({
  light: {
    when: (state) => state.hasBulb,
    reason: 'Pick up the lightbulb',
  },
  tower: {
    when: (state) => state.towerOpen,
    reason: 'Open the way to the Tower',
  },
});

const state = { hasBulb: true, towerOpen: false };
const result = canRestoreSun.evaluate(state);
// { ready: false, missing: ['Open the way to the Tower'], failed: [{ key: 'tower', reason: 'Open the way to the Tower' }] }

canRestoreSun.evaluate({ hasBulb: true, towerOpen: true }).ready; // true

// The check runs again when the player acts, so the Tower never accepts a stale UI.
canRestoreSun.run(state, () => console.log('The sun rises again'));
// Throws CheckBlockedError with .result while anything is still dark.
```

## API

- `createCheck<Context>(rules)` defines ordered, named requirements
- `evaluate(context)` returns `ready`, `missing`, and `failed` (keys + reasons)
- `run(context, action)` checks again, then calls the action or throws `CheckBlockedError`
- A `reason` may be a string or `(context) => string`, so the message can mention the current state

## Behavior

Conditions should be synchronous and side-effect free. Pass current state every time; nothing is cached. The Player sees the whole journey; your users see only the screen in front of them — show the missing pieces where they act, not in a log they will never open

`run()` is a convenience guard, **not an authorization or security boundary** — validate privileged actions on the server. If `action` returns a Promise, that Promise is returned unchanged; the requirements themselves are synchronous

SunCheck will not carry the bulb to the Tower for you, and it will not reset the world after a mistake. It only makes the next step visible

## Development

```bash
npm install
npm test
npm run build
```

See `examples/react.tsx` for integration
---

An independent project. Not affiliated with or endorsed by any game studio

<img src="images/niko_pilesos.gif">
