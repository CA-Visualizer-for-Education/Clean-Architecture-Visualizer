import { useEffect, useRef, useCallback, useMemo } from 'react';
import type * as Monaco from 'monaco-editor';
import { useFileViewer, useFileRelations } from '../../../actions/useCodebase';
import { FileRelation } from '../../../lib';
interface UseMonacoDecorationsProps {
  interactionId: string;
  filePath: string;
  onFileChange: (newPath: string) => void;
}

export const useMonacoDecorations = ({
  interactionId,
  filePath,
  onFileChange,
}: UseMonacoDecorationsProps) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationIds = useRef<string[]>([]);
  const linkProviderRef = useRef<Monaco.IDisposable | null>(null);

  const { data, isLoading, isError } = useFileViewer(interactionId, filePath);
  const { data: relationsData } = useFileRelations(interactionId, filePath);

  const relations = useMemo(() => {
  if (!relationsData) return [];
  return Array.isArray(relationsData) ? relationsData : relationsData.relations ?? [];
}, [relationsData]);

  const applyDecorations = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !data) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];

    // Violations
    data.lines_with_violations?.forEach((line: number) => {
      newDecorations.push({
        range: new monacoRef.current!.Range(line, 1, line, model.getLineMaxColumn(line)),
        options: {
          isWholeLine: true,
          className: 'violation-highlight',
          glyphMarginClassName: 'violation-glyph',
        },
      });
    });

    // Relations
    relations.forEach((rel: { line?: number; type?: string; target_file?: string }) => {
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

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      applyDecorations();

      // Cmd/Ctrl click navigation
      editor.onMouseUp((e) => {
        const evt = e.event.browserEvent;
        if (!(evt.metaKey || evt.ctrlKey)) return;

        const line = e.target.position?.lineNumber;
        if (!line) return;

        const match = relations.find((rel: FileRelation) => rel.line === line);
        if (match?.target_file) onFileChange(match.target_file);
      });
    },
    [applyDecorations, onFileChange, relations]
  );

  // Re-apply decorations when data changes
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
          .filter((rel: FileRelation) => rel.line && rel.target_file)
          .map((rel: FileRelation) => ({
            range: new monacoRef.current!.Range(rel.line!, 1, rel.line!, model.getLineMaxColumn(rel.line!)),
            url: `file://${rel.target_file}`,
          }));
        return { links };
      },
    });

    return () => linkProviderRef.current?.dispose();
  }, [data?.language, relations]);

  // Cleanup
  useEffect(() => () => {
    decorationIds.current = [];
    linkProviderRef.current?.dispose();
  }, []);

  return { editorRef, monacoRef, handleEditorMount, data, isLoading, isError };
};