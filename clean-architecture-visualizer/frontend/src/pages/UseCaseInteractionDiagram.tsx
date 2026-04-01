import { Link, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { CADiagram } from '../components/diagram';

export default function UseCaseInteractionDiagram() {
    const { useCaseId, interactionId } = useParams();
    return (
        <div className="use-case-interaction-diagram">
            <Header />
            <main className="page-content">
                <section>
                    <p>
                        {useCaseId && interactionId
                            ? `Diagram for Use Case ${useCaseId}, Interaction ${interactionId}`
                            : 'Explore the use case interactions and their code implementations.'}
                    </p>
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

