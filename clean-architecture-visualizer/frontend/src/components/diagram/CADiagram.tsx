import { Typography, Container, Box } from '@mui/material';
import { CANodeView } from './index';

export function CADiagram() {
    return (
        // Placeholder for the actual diagram rendering logic
        <><Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" gutterBottom>
                Clean Architecture Diagram
            </Typography>
            <Container sx={{
                bgcolor: 'adapters.light', justifyContent: 'center', borderStyle: 'solid', borderColor: 'adapters.contrastText', borderRadius: 2, borderWidth: 2,
            }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, justifyItems: 'center' }}>
                    <Box>
                        <CANodeView node={{
                            id: '1',
                            name: 'Controller',
                            type: 'Controller',
                            layer: 'InterfaceAdapters',
                            status: 'VALID',
                        }} />
                    </Box>
                    <Box>
                        <CANodeView node={{
                            id: '2',
                            name: 'Presenter',
                            type: 'Presenter',
                            layer: 'InterfaceAdapters',
                            status: 'VALID',
                        }} />
                    </Box>
                </Box>
            </Container>

            <Container sx={{
                bgcolor: 'useCases.light', justifyContent: 'center', borderStyle: 'solid', borderColor: 'useCases.contrastText', borderRadius: 2, borderWidth: 2,
            }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, justifyItems: 'center' }}>
                    <Box>
                        <CANodeView node={{
                            id: '3',
                            name: 'Input Boundary',
                            type: 'InputBoundary',
                            layer: 'ApplicationBusinessRules',
                            status: 'VALID',
                        }} />
                    </Box>
                    <Box>
                        <CANodeView node={{
                            id: '4',
                            name: 'Use Case Interactor',
                            type: 'Interactor',
                            layer: 'ApplicationBusinessRules',
                            status: 'VALID',
                        }} />
                    </Box>
                </Box>
            </Container>

            <Container sx={{
                bgcolor: 'entities.light', justifyContent: 'center', borderStyle: 'solid', borderColor: 'entities.contrastText', borderRadius: 2, borderWidth: 2,
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CANodeView node={{
                    id: '5',
                    name: 'Entities',
                    type: 'Entity',
                    layer: 'EnterpriseBusinessRules',
                    status: 'VALID',
                }} />
                </Box>
            </Container>  

            <Container sx={{
                bgcolor: 'drivers.light', justifyContent: 'center', borderStyle: 'solid', borderColor: 'drivers.contrastText', borderRadius: 2, borderWidth: 2,
            }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, justifyItems: 'center' }}>
                    <Box>
                        <CANodeView node={{
                            id: '6',
                            name: 'View',
                            type: 'View',
                            layer: 'Frameworks',
                            status: 'VALID',
                        }} />
                    </Box>
                    <Box>
                        <CANodeView node={{
                            id: '7',
                            name: 'Database',
                            type: 'Database',
                            layer: 'Frameworks',
                            status: 'VALID',
                        }} />
                    </Box>
                </Box>
            </Container>         
        </Container>
        </>
    );
}