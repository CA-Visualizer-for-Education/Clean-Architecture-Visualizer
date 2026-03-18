import { useEffect, useRef, useMemo, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme, Theme } from '@mui/material/styles';
import type * as Monaco from 'monaco-editor';
import { useFileViewer, useFileRelations } from '../../../actions/useCodebase';
import { LAYER_METADATA, CALayer, FileRelation, FileContent } from '../../../lib';
import { Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ViewerContainer, HeaderContainer, EditorCard, LayerChip, StatusContainer, BreadcrumbPath } from './styles';
import { useTranslation } from 'react-i18next';

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

type CodeViewerProps = {
  interactionId: string;
  filePath: string | null;
  onFileChange: (newPath: string) => void;
};

export const CodeViewer = ({ interactionId, filePath, onFileChange }: CodeViewerProps) => {
  const muiTheme = useTheme();
  const { t } = useTranslation('codeViewer');
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationIds = useRef<string[]>([]);
  const linkProviderRef = useRef<Monaco.IDisposable | null>(null);
  const relationsRef = useRef<FileRelation[]>([]);

  const { data, isLoading, isError } = useFileViewer(interactionId, filePath) as { data?: FileContent; isLoading: boolean; isError: boolean };
  const { data: relationsData } = useFileRelations(interactionId, filePath) as { data?: FileRelation[] | { relations: FileRelation[] } };

  const relations = useMemo(() => {
    if (!relationsData) return [];
    return Array.isArray(relationsData) ? relationsData : relationsData.relations ?? [];
  }, [relationsData]);

  useEffect(() => {
    relationsRef.current = relations;
  }, [relations]);

  const layer = data?.layer;

const layerInfo = useMemo(() => 
  layer ? LAYER_METADATA[layer as CALayer] : null
, [layer]);

  // Link Provider & Decoration logic remains same to preserve "Cmd+Click" functionality
  useEffect(() => {
    if (!monacoRef.current || !data?.language || !editorRef.current) return;
    linkProviderRef.current?.dispose();
    linkProviderRef.current = monacoRef.current.languages.registerLinkProvider(data.language, {
      provideLinks: (model) => {
        const links = relations
          .filter((rel) => rel.line && rel.target_file)
          .map((rel) => ({
            range: new monacoRef.current!.Range(rel.line, 1, rel.line, model.getLineMaxColumn(rel.line)),
            url: `file://${rel.target_file}`, 
          }));
        return { links };
      },
    });
    return () => linkProviderRef.current?.dispose();
  }, [data?.language, relations]);

  const applyDecorations = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !data) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];
    data.lines_with_violations?.forEach((line) => {
      newDecorations.push({
        range: new monacoRef.current!.Range(line, 1, line, 1),
        options: { isWholeLine: true, className: 'violation-highlight' },
      });
    });

    relations.forEach((rel) => {
      const relMeta = LAYER_METADATA[rel.layer as CALayer];
      if (!rel.line || !relMeta) return;
      newDecorations.push({
        range: new monacoRef.current!.Range(rel.line, 1, rel.line, 1),
        options: {
          isWholeLine: true,
          className: `relation-highlight-${relMeta.paletteKey}`,
          hoverMessage: { value: t('layerLabel', { label: relMeta.label }) },
        },
      });
    });
    decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, newDecorations);
  }, [data, relations]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme('caveTheme', getMonacoThemeConfig(muiTheme));
    monaco.editor.setTheme('caveTheme');
    applyDecorations();
    editor.onMouseUp((e) => {
      const evt = e.event.browserEvent;
      if (!(evt.metaKey || evt.ctrlKey)) return;
      const line = e.target.position?.lineNumber;
      if (!line) return;
      const match = relationsRef.current.find((rel) => rel.line === line);
      if (match?.target_file) onFileChange(match.target_file);
    });
  };

  useEffect(() => { applyDecorations(); }, [data, relations, applyDecorations]);
  useEffect(() => { return () => { linkProviderRef.current?.dispose(); }; }, []);

  if (!filePath) return <StatusContainer>{t('selectFile')}</StatusContainer>;
  if (isLoading) return <StatusContainer>{t('loading')}</StatusContainer>;
  if (isError || !data) {
    return (
      <StatusContainer isError>
        {t('errorLoading', { path: filePath })}
      </StatusContainer>
    );
  }

  return (
    <ViewerContainer>
      <HeaderContainer>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          {filePath.split('/').map((part, index, arr) => {
            const isLast = index === arr.length - 1;
            return (
              <BreadcrumbPath 
                key={`${part}-${index}`} 
                isLast={isLast}
              >
                {part}
              </BreadcrumbPath>
            );
          })}
        </Breadcrumbs>

        {layerInfo && (
          <LayerChip 
            label={layerInfo.label}
            size="small"
            layerkey={layerInfo.paletteKey} 
          />
        )}
      </HeaderContainer>

      <EditorCard elevation={0}>
        <Editor
          key={filePath}
          height="100%"
          language={data.language}
          value={data.content}
          onMount={handleEditorDidMount}
          options={{ readOnly: true, automaticLayout: true, glyphMargin: true }}
        />
      </EditorCard>
    </ViewerContainer>
  );
};