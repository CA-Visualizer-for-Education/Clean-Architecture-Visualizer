import React from 'react';
import { useTheme } from "../hooks/useTheme";
import type { CALayer } from '../lib/types';

interface CAComponentProps {
    title: string;
    variant?: CALayer;
}

const CAComponent: React.FC<CAComponentProps> = ({
    title,
    variant = 'ApplicationBusinessRules',
}) => {
    const theme = useTheme();
    const colorVariants: Record<CALayer, { background: string; text: string }> = {
        ApplicationBusinessRules: { background: theme.colors.componentUseCases, text: theme.colors.text },
        EnterpriseBusinessRules: { background: theme.colors.componentEntities, text: theme.colors.text },
        InterfaceAdapters: { background: theme.colors.componentAdapters, text: theme.colors.text },
        Frameworks: { background: theme.colors.componentDrivers, text: theme.colors.text },
    };

    const { background, text } = colorVariants[variant];

    return (
        <div
            style={{
                backgroundColor: background,
                color: text,
                padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                borderRadius: theme.spacing.xs,
                fontWeight: 600,
                minWidth: '140px',
                textAlign: 'center',
                border: `2px solid ${theme.colors.componentBorder}`,
            }}
        >
            {title}
        </div>
    );
};

export default CAComponent;