import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import styles from './HomeButtonCard.module.css';

interface HomeButtonCardProps {
  title: string;
  description: string;
  to: string;
  icon: React.ReactElement;
  bgColor?: string;
  iconColor?: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  ctaLabel?: string;
  ctaColor?: string;
}

export default function HomeButtonCard({
  title,
  description,
  to,
  icon,
  bgColor,
  iconColor = 'white',
  badge,
  badgeBg = '#EBF4FC',
  badgeColor = '#207FD4',
  ctaLabel = 'Get started',
  ctaColor = 'primary.main',
}: HomeButtonCardProps) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.illustration}>
        {badge && (
          <Box
            component="span"
            className={styles.stepBadge}
            sx={{
              bgcolor: badgeBg,
              color: badgeColor,
            }}
          >
            {badge}
          </Box>
        )}

        <Box className={styles.illustrationInner} sx={{ bgcolor: bgColor }}>
          {React.cloneElement(icon, {
            sx: {
              ...icon.props.sx,
              fontSize: 72,
              color: iconColor,
            },
          })}
        </Box>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>

        <p className={styles.description}>{description}</p>

        <Box component="span" className={styles.cta} sx={{ color: ctaColor }}>
          {ctaLabel}
          <span aria-hidden>›</span>
        </Box>
      </div>
    </Link>
  );
}
