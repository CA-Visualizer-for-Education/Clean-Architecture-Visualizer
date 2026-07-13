import { useParams } from 'react-router-dom';
import '../i18n/config';
import Header from '../components/common/Header';
import { CADiagram, Legend, SideBar } from '../components/diagram';
import {
  MainViewContainer,
  PageContainer,
  Workspace,
} from '../components/diagram/CADiagramPageLayout';
import ViolationsSideBarContent from '../components/diagram/ViolationsSideBarContent';
import { usePersistentBoolean } from '../hooks/usePersistentBoolean';
import { USE_CASE_SIDEBAR_OPEN_STORAGE_KEY } from '../lib/storageKeys';

export default function UseCaseInteractionDiagram() {
  const { interactionId } = useParams();
  const [isOpen, setIsOpen] = usePersistentBoolean(
    USE_CASE_SIDEBAR_OPEN_STORAGE_KEY,
    true
  );

  return (
    <PageContainer>
      <Header />
      <Workspace>
        <MainViewContainer>
          <CADiagram />
          <Legend />
        </MainViewContainer>

        <SideBar isOpen={isOpen} onOpenChange={setIsOpen}>
          <ViolationsSideBarContent interactionId={interactionId} />
        </SideBar>
      </Workspace>
    </PageContainer>
  );
}
