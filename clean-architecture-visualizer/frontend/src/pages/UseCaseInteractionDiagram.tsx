import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n/config';
import Header from '../components/common/Header';
import { CADiagram, Legend, SideBar, type NodeClickInfo } from '../components/diagram';
import { useState } from 'react';
import { MainViewContainer, PageContainer, Workspace } from '../components/diagram/CADiagramPageLayout';
import ViolationsSideBarContent from '../components/diagram/ViolationsSideBarContent';
import { CtaButton } from '../components/common/Button';

export default function UseCaseInteractionDiagram() {
    const { useCaseId, interactionId } = useParams();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const { t } = useTranslation('useCaseInteractionDiagram');

    const codeRoute = useCaseId && interactionId
        ? `/use-case/${useCaseId}/interaction/${interactionId}/code`
        : '/use-case-interaction-code';

    const handleNodeClick = (info: NodeClickInfo) => {
        if (!useCaseId || !interactionId || !info.filePath) {
            return;
        }

        navigate(
            `/use-case/${useCaseId}/interaction/${interactionId}/code?file=${encodeURIComponent(info.filePath)}`,
        );
    };
    
    return (
        <PageContainer>
            <Header
                actions={
                    <CtaButton
                        variant="outlined"
                        onClick={() => navigate(codeRoute)}
                        startIcon={<span>{'</>'}</span>}
                    >
                        {t('actions.viewUseCaseInteractionCode')}
                    </CtaButton>
                }
            />
            <Workspace>
                <MainViewContainer>
                    <CADiagram onNodeClick={handleNodeClick} />
                    <Legend />
                </MainViewContainer>

                <SideBar isOpen={isOpen} onOpenChange={setIsOpen}>
                    <ViolationsSideBarContent interactionId={interactionId} />
                </SideBar>
            </Workspace>
        </PageContainer>
    );
}

