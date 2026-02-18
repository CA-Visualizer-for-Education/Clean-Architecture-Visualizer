import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header.tsx';

const UseCaseInteractionDiagram: React.FC = () => {
    return (
        <div className="use-case-interaction-diagram">

            <Header />

            <main className="page-content">
                <section>
                    <p>Explore the use case interactions and their code implementations.</p>
                    <Link to="/use-case-interaction-code" className="btn btn-primary">
                        View Use Case Interaction Code
                    </Link>
                </section>
            </main>
        </div>
    );
};

export default UseCaseInteractionDiagram;