import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea } from '@mui/material';
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

const isExternalLink = (to: string) => /^https?:\/\//.test(to);

const HomeButtonCard = ({
  title,
  description,
  to,
  icon,
  bgColor = 'white',
  iconColor = 'white',
  badge,
  badgeBg = '#EBF4FC',
  badgeColor = '#207FD4',
  ctaLabel = 'Get started',
  ctaColor = 'primary.main',
}: HomeButtonCardProps) => {
  const linkProps = isExternalLink(to)
    ? {
        component: 'a' as const,
        href: to,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : { component: RouterLink, to };

  return (
    <Card
      elevation={0}
      sx={{ background: 'transparent', width: '100%', bgcolor: bgColor }}
      className={styles.card}
    >
      <CardActionArea
        {...linkProps}
        sx={{
          borderRadius: 4,
          p: 2,
          textAlign: 'center',
          display: 'block',
          '&:hover .icon-box': { transform: 'scale(1.05)' },
        }}
      >
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

          <Box
            className="icon-box"
            sx={{
              width: 140,
              height: 140,
              mx: 'auto',
              mb: 3,
              bgcolor: bgColor,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: {
                ...((
                  icon as React.ReactElement & {
                    props?: { sx?: Record<string, unknown> };
                  }
                ).props?.sx || {}),
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
      </CardActionArea>
    </Card>
  );
};

export default HomeButtonCard;
