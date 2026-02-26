# Visualizer Frontend

This React app displays a Java file with function-name highlighting. It is used by the CAVE CLI command `cave view <filePath>`.

**Note:** This application uses Vite and requires **Node.js 18+** (or 20+ recommended). If `npm run dev` fails, upgrade Node and run `npm install` again.

## Launching the React app

### Option 1: Via the CLI (recommended)

From the **clean-architecture-visualizer** project root (or anywhere after `npm link`):

```bash
cave view <path/to/YourFile.java>
```

e.g. from the package root:

```bash
cave view examples/helloworld.java
```

This will:

1. Read the Java file
2. Write its contents to `frontend/public/cave-view-payload.json`
3. Start the Vite dev server for this React app (port 5173)
4. Open your browser to `http://localhost:5173`

The React app loads `/cave-view-payload.json` and shows the file with function names highlighted.

### Option 2: Run the dev server manually

If you want to open the viewer without the CLI:

1. Install dependencies (from this directory):

   ```bash
   cd frontend
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

If a payload was previously written by `cave view`, that file will be shown. Otherwise you’ll see “No file loaded”.

### Option 3: Build and preview production

```bash
cd frontend
npm install
npm run build
npm run preview
```

Then open the URL shown (e.g. `http://localhost:5173`).
