import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import '../../i18n/config';
import Header from '../../components/common/Header';
import { FileExplorer } from '../../components/code/FileExplorer';
import { CodeViewer } from '../../components/code/CodeViewer';
import { SideBar } from '../../components/diagram';
import ViolationsSideBarContent from '../../components/diagram/ViolationsSideBarContent';
import {
  PageContainer,
  Workspace,
  SidebarContainer,
  Resizer,
  MainViewContainer,
} from './layout';
import { useResizableSidebar } from './useResizableSidebar.tsx';
import { CtaButton } from '../../components/common/Button.tsx';
import { useTranslation } from 'react-i18next';
import { usePersistentBoolean } from '../../hooks/usePersistentBoolean';
import { USE_CASE_SIDEBAR_OPEN_STORAGE_KEY } from '../../lib/storageKeys';

const UseCaseInteractionCode = () => {
  const { useCaseId, interactionId } =
    useParams<{ useCaseId: string; interactionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('useCaseInteractionCode');

  const navigate = useNavigate();

  const { width, startResizing } = useResizableSidebar(300);

  const activeFilePath = searchParams.get('file');
  const [isOpen, setIsOpen] = usePersistentBoolean(USE_CASE_SIDEBAR_OPEN_STORAGE_KEY, true);
  const [history, setHistory] = useState<string[]>([]);

  const setFileQuery = (path: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (path) {
        next.set('file', path);
      } else {
        next.delete('file');
      }
      return next;
    }, { replace: true });
  };

  const handleNavigate = (newPath: string) => {
    if (activeFilePath) {
      setHistory(prev => [...prev, activeFilePath]);
    }
    setFileQuery(newPath);
  };

  const handleBack = () => {
    setHistory(prev => {
      if (!prev.length) return prev;
      const previousPath = prev[prev.length - 1];
      setFileQuery(previousPath);
      return prev.slice(0, -1);
    });
  };

  if (!interactionId) {
    return <div>Error: Interaction ID is missing.</div>;
  }

  return (
    <PageContainer>
      <Header
        actions={
          <>
            <CtaButton
              variant="outlined"
              startIcon={<span>←</span>}
              onClick={() => navigate(`/use-case/${useCaseId}/interaction/${interactionId}/diagram`)}
            >
              {t('actions.backToDiagram')}
            </CtaButton>

            <CtaButton
              variant="outlined"
              startIcon={<span>←</span>}
              onClick={handleBack}
              disabled={!history.length}
            >
              {t('actions.backToPrevious')}
            </CtaButton>
          </>
        }
      />

      <Workspace>
        <SidebarContainer sidebarWidth={width}>
          <FileExplorer
            onSelect={handleNavigate}
            activeFilePath={activeFilePath}
          />
        </SidebarContainer>

        <Resizer onMouseDown={startResizing} />

        <MainViewContainer>
          <CodeViewer
            interactionId={interactionId}
            filePath={activeFilePath}
            onFileChange={handleNavigate}
          />
        </MainViewContainer>

        <SideBar isOpen={isOpen} onOpenChange={setIsOpen}>
          <ViolationsSideBarContent interactionId={interactionId} />
        </SideBar>
      </Workspace>
    </PageContainer>
  );
};

export default UseCaseInteractionCode;