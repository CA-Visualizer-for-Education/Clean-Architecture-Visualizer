import { useEffect, useRef, useMemo, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme, Theme } from '@mui/material/styles';
import type * as Monaco from 'monaco-editor';
import { useFileViewer, useFileRelations } from '../../../actions/useCodebase';
import { FileRelation } from '../../../lib';

export type FileData = {
  language: string;
  content: string;
  lines_with_violations?: number[];
};

type CodeViewerProps = {
  interactionId: string;
  filePath: string | null;
  onFileChange: (newPath: string) => void;
};

const getMonacoThemeConfig = (theme: Theme): Monaco.editor.IStandaloneThemeData => ({
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': theme.palette.background.default,
    'editor.foreground': theme.palette.text.primary,
    'editorLineNumber.foreground': theme.palette.text.secondary,
    'editor.selectionBackground': theme.palette.primary.main,
    'editor.lineHighlightBackground': '#f5f5f5',
  },
});

export const CodeViewer = ({ interactionId, filePath, onFileChange }: CodeViewerProps) => {
  const muiTheme = useTheme();

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationIds = useRef<string[]>([]);
  const linkProviderRef = useRef<Monaco.IDisposable | null>(null);

  const { data, isLoading, isError } = useFileViewer(
    interactionId,
    filePath ?? ''
  ) as { data?: FileData; isLoading: boolean; isError: boolean };

  const { data: relationsData } = useFileRelations(
    interactionId,
    filePath ?? ''
  ) as { data?: FileRelation[] | { relations: FileRelation[] } };

  const relations: FileRelation[] = useMemo(() => {
    if (!relationsData) return [];
    return Array.isArray(relationsData)
      ? relationsData
      : relationsData.relations ?? [];
  }, [relationsData]);

  // Apply line decorations (violations + relations)
  const applyDecorations = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !data) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];

    data.lines_with_violations?.forEach((line) => {
      newDecorations.push({
        range: new monacoRef.current!.Range(line, 1, line, model.getLineMaxColumn(line)),
        options: { isWholeLine: true, className: 'violation-highlight', glyphMarginClassName: 'violation-glyph' },
      });
    });

    relations.forEach((rel) => {
      if (!rel.line) return;
      newDecorations.push({
        range: new monacoRef.current!.Range(rel.line, 1, rel.line, model.getLineMaxColumn(rel.line)),
        options: {
          isWholeLine: true,
          className: `relation-highlight-${rel.type?.toLowerCase() || 'default'}`,
          glyphMarginClassName: 'relation-glyph',
        },
      });
    });

    decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, newDecorations);
  }, [data, relations]);

  // Editor mount callback
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define and set the theme inside mount
    const monacoThemeConfig = getMonacoThemeConfig(muiTheme);
    monaco.editor.defineTheme('customTheme', monacoThemeConfig);
    monaco.editor.setTheme('customTheme');

    applyDecorations();

    editor.onMouseUp((e) => {
      const evt = e.event.browserEvent;
      if (!(evt.metaKey || evt.ctrlKey)) return;

      const line = e.target.position?.lineNumber;
      if (!line) return;

      const match = relations.find((rel) => rel.line === line);
      if (match?.target_file) onFileChange(match.target_file);
    });
  };

  // Re-apply decorations when data or relations change
  useEffect(() => {
    applyDecorations();
  }, [applyDecorations]);

  // Register link provider
  useEffect(() => {
    if (!monacoRef.current || !data?.language) return;

    linkProviderRef.current?.dispose();
    linkProviderRef.current = monacoRef.current.languages.registerLinkProvider(data.language, {
      provideLinks: (model) => {
        const links = relations
          .filter((rel) => rel.line && rel.target_file)
          .map((rel) => ({
            range: new monacoRef.current!.Range(rel.line!, 1, rel.line!, model.getLineMaxColumn(rel.line!)),
            url: `file://${rel.target_file}`,
          }));
        return { links };
      },
    });

    return () => {
      linkProviderRef.current?.dispose();
    };
  }, [data?.language, relations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      decorationIds.current = [];
      linkProviderRef.current?.dispose();
    };
  }, []);

  if (!filePath) return <div className="p-4">Select a file to view content.</div>;
  if (isLoading) return <div className="p-4">Loading code...</div>;
  if (isError || !data) return <div className="p-4 text-red-500">Error loading file: {filePath}</div>;

  return (
    <Editor
      key={filePath}
      height="100vh"
      language={data.language}
      value={data.content}
      options={{
        readOnly: true,
        glyphMargin: true,
        links: true,
        renderLineHighlight: 'all',
        scrollBeyondLastLine: false,
      }}
      onMount={handleEditorDidMount}
    />
  );
};