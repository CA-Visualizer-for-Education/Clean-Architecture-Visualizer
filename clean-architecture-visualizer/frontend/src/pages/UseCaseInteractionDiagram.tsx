import { Link, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { CADiagram } from '../components/diagram';
import { Typography } from '@mui/material';

export default function UseCaseInteractionDiagram() {
    const { useCaseId, interactionId } = useParams();
    return (
        <div className="use-case-interaction-diagram">
            <Header />
            <main className="page-content">
                <section>
                    <Typography variant="h4" gutterBottom align="center">
                        {useCaseId && interactionId
                            ? `Diagram for Use Case ${useCaseId}, Interaction ${interactionId}`
                            : 'Explore the use case interactions and their code implementations.'}
                    </Typography>
                    <CADiagram />
                    <Link
                        to={useCaseId && interactionId
                            ? `/use-case/${useCaseId}/interaction/${interactionId}/code`
                            : '/use-case-interaction-code'}
                        className="btn btn-primary"
                    >
                        View Use Case Interaction Code
                    </Link>
                </section>
            </main>
        </div>
    );
}

