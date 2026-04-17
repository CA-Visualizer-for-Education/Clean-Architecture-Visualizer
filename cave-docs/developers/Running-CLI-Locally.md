---
sidebar_position: 3
---

# Running CLI Locally

When making quick changes to the CLI you may want to do a quick sanity check that your implementations work and output what you expect before writing/modifying tests. 

### First Time Running

```bash
npm run build
npm link
cave <command>
```

### Afterwards

```bash
npm unlink -g
npm run bulid
npm link
cave <command>
```
