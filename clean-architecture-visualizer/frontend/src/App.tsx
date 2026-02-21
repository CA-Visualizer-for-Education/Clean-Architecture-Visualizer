import { useEffect, useState } from "react";

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

function highlightJavaFunctions(escapedContent: string): string {
  return escapedContent.replace(
    /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    (_, functionName) => `<span>${functionName}</span>(`,
  );
}

function App() {
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
  const highlighted = highlightJavaFunctions(escaped);
  const title = data.filePath
    ? data.filePath.replace(/^.*[/\\]/, "")
    : "Java file";

  return (
    <div>
      <h1>{title}</h1>
      {data.filePath && <p>{data.filePath}</p>}
      <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  );
}

export default App;
