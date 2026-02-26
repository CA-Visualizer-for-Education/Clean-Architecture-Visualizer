import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import StylingGuideline from "./pages/StylingGuideline";

interface ViewPayload {
  filePath: string;
  content: string;
  error: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightSourceFunctions(escapedContent: string): string {
  return escapedContent.replace(
    /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    (_, functionName) => `<span>${functionName}</span>(`,
  );
}

function ViewerPage() {
  const [payload, setPayload] = useState<ViewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/cave-view-payload.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ViewPayload) => {
        setPayload(data);
      })
      .catch((err) => {
        setFetchError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <p>Loading…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <p>Could not load payload: {fetchError}</p>
      </div>
    );
  }

  const data = payload!;
  const hasContent = data.content != null && data.content.length > 0;
  const displayError = data.error || null;

  if (displayError) {
    return (
      <div>
        <h1>Visualizer</h1>
        <p>{displayError}</p>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div>
        <h1>Visualizer</h1>
        <p>No file loaded. Run: cave view &lt;filePath&gt;</p>
      </div>
    );
  }

  const escaped = escapeHtml(data.content);
  const highlighted = highlightSourceFunctions(escaped);
  const title = data.filePath
    ? data.filePath.replace(/^.*[/\\]/, "")
    : "source file";

  return (
    <div>
      <h1>{title}</h1>
      {data.filePath && <p>{data.filePath}</p>}
      <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  );
}

function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <Link to="/">Viewer</Link>
        <Link to="/styling-guideline">Styling Guideline</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ViewerPage />} />
        <Route path="/styling-guideline" element={<StylingGuideline />} />
      </Routes>
    </div>
  );
}

export default App;
