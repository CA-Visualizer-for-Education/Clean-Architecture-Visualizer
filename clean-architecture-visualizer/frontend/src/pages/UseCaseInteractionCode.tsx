import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';

const UseCaseInteractionCode: React.FC = () => {
    return (
        <div className="use-case-interaction-code">

            <Header />

            <main className="page-content">
                <section>
                    <p>Explore the use case interactions and their code implementations.</p>
                    <Link to="/use-case-interaction-diagram" className="btn btn-primary">
                        View Use Case Interaction Diagram
                    </Link>
                </section>
            </main>
        </div>
    );
};

export default UseCaseInteractionCode;