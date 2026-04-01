import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea, CardContent } from '@mui/material';

interface HomeButtonCardProps {
  title: string;
  description: string;
  to: string;
  icon: React.ReactElement;
  bgColor: string;
  iconColor?: string;
}

const HomeButtonCard = ({ 
  title, 
  description, 
  to, 
  icon, 
  bgColor, 
  iconColor = 'white' 
}: HomeButtonCardProps) => {
  return (
    <Card elevation={0} sx={{ background: 'transparent', width: '100%' }}>
      <CardActionArea 
        component={RouterLink} 
        to={to} 
        sx={{ 
          borderRadius: 4, 
          p: 2, 
          textAlign: 'center',
          '&:hover .icon-box': { transform: 'scale(1.05)' }
        }}
      >
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
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          {/* Ensure the icon itself is treated as a block or flex item */}
          {React.cloneElement(icon as React.ReactElement, { 
            sx: { 
                fontSize: 70, 
                color: iconColor,
                display: 'block' 
            } 
          })}
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, mx: 'auto' }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default HomeButtonCard;