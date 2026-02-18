import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import LearningMode from './pages/LearningMode.tsx';
import CheckerMode from './pages/CheckerMode.tsx';
import ProjectStarter from './pages/ProjectStarter.tsx';
import UseCaseInteractionDiagram from './pages/UseCaseInteractionDiagram.tsx';
import UseCaseInteractionCode from './pages/UseCaseInteractionCode.tsx';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/learning' element={<LearningMode />} />
                <Route path='/checker' element={<CheckerMode />} />
                <Route path='/project-starter' element={<ProjectStarter />} />
                <Route path='/use-case-interaction-diagram' element={<UseCaseInteractionDiagram />} />
                <Route path='/use-case-interaction-code' element={<UseCaseInteractionCode />} />
                {/* Add other routes here */}
            </Routes>
        </Router>
    );
};

export default App;



// import { useEffect, useState } from 'react'
// import './JavaViewer.css'

// interface JavaPayload {
//   filePath: string
//   content: string
//   error: string | null
// }

// function escapeHtml(text: string): string {
//   return text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
// }

// function highlightJavaFunctions(escapedContent: string): string {
//   return escapedContent.replace(
//     /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
//     (_, functionName) =>
//       `<span class="java-viewer__function">${functionName}</span>(`
//   )
// }

// function App() {
//   const [payload, setPayload] = useState<JavaPayload | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [fetchError, setFetchError] = useState<string | null>(null)

//   useEffect(() => {
//     fetch('/cave-java-payload.json')
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`)
//         return res.json()
//       })
//       .then((data: JavaPayload) => {
//         setPayload(data)
//       })
//       .catch((err) => {
//         setFetchError(err.message)
//       })
//       .finally(() => {
//         setLoading(false)
//       })
//   }, [])

//   if (loading) {
//     return (
//       <div className="java-viewer">
//         <p className="java-viewer__empty">Loading…</p>
//       </div>
//     )
//   }

//   if (fetchError) {
//     return (
//       <div className="java-viewer">
//         <p className="java-viewer__error">Could not load payload: {fetchError}</p>
//       </div>
//     )
//   }

//   const data = payload!
//   const hasContent = data.content != null && data.content.length > 0
//   const displayError = data.error || null

//   if (displayError) {
//     return (
//       <div className="java-viewer">
//         <h1 className="java-viewer__title">Java Viewer</h1>
//         <p className="java-viewer__error">{displayError}</p>
//       </div>
//     )
//   }

//   if (!hasContent) {
//     return (
//       <div className="java-viewer">
//         <h1 className="java-viewer__title">Java Viewer</h1>
//         <p className="java-viewer__empty">
//           No file loaded. Run: cave read-java &lt;filePath&gt;
//         </p>
//       </div>
//     )
//   }

//   const escaped = escapeHtml(data.content)
//   const highlighted = highlightJavaFunctions(escaped)
//   const title = data.filePath
//     ? data.filePath.replace(/^.*[/\\]/, '')
//     : 'Java file'

//   return (
//     <div className="java-viewer">
//       <h1 className="java-viewer__title">{title}</h1>
//       {data.filePath && (
//         <p className="java-viewer__path">{data.filePath}</p>
//       )}
//       <pre
//         className="java-viewer__pre"
//         dangerouslySetInnerHTML={{ __html: highlighted }}
//       />
//     </div>
//   )
// }

// export default App
