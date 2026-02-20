# Java Viewer (React)

This React app displays a Java file with function-name highlighting. It is used by the CAVE CLI command `cave read-java <filePath>`.

**Note:** The Java viewer uses Vite and requires **Node.js 18+** (or 20+ recommended). If `npm run dev` fails, upgrade Node and run `npm install` again.

## Launching the React app

### Option 1: Via the CLI (recommended)

From the **clean-architecture-visualizer** project root (or anywhere after `npm link`):

```bash
cave read-java <path/to/YourFile.java>
```

This will:

1. Read the Java file
2. Write its contents to `java-viewer/public/cave-java-payload.json`
3. Start the Vite dev server for this React app (port 5173)
4. Open your browser to `http://localhost:5173`

The React app loads `/cave-java-payload.json` and shows the file with function names highlighted.

### Option 2: Run the dev server manually

If you want to open the viewer without the CLI (e.g. to view the last file again or test the UI):

1. Install dependencies (from this directory):

   ```bash
   cd java-viewer
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

If a payload was previously written by `cave read-java`, that file will be shown. Otherwise you’ll see “No file loaded”.

### Option 3: Build and preview production

```bash
cd java-viewer
npm install
npm run build
npm run preview
```

Then open the URL shown (e.g. `http://localhost:5173`). Again, content comes from `public/cave-java-payload.json` if present.

## Wiring to `cave read-java <filePath>`

The command is already wired:

- **Command:** `cave read-java <filePath>`
- **Behavior:** Reads the Java file, writes a JSON payload into `java-viewer/public/cave-java-payload.json`, starts the React app’s dev server, and opens the browser to the viewer.

**Console-only output (no React):**

```bash
cave read-java <filePath> --console
```

This only prints the file contents to the terminal with function names highlighted and does not start the React app.

## Project layout

- **HTML:** `index.html` – root document; styling is not inline; it’s in CSS files.
- **Styling:** `src/JavaViewer.css` – Java viewer theme and layout; imported in `App.tsx`.
- **Entry:** `src/main.tsx` – mounts the app; `src/App.tsx` – fetches the payload and renders the Java viewer.
