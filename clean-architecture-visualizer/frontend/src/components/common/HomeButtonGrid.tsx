import React from 'react';
import { Grid } from '@mui/material';
import HomeButtonCard from './HomeButtonCard';

interface GridItem {
  title: string;
  description: string;
  to: string;
  icon: React.ReactElement;
  bgColor: string;
  iconColor?: string;
}

interface HomeButtonGridProps {
  items: GridItem[];
}

const HomeButtonGrid = ({ items }: HomeButtonGridProps) => {
  return (
    <Grid 
      container 
      spacing={2} 
      justifyContent="center" 
      sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}
    >
      {items.map((item) => (
        <Grid 
          key={item.to}
          size={{ xs: 12, md: 4 }} 
          display="flex" 
          justifyContent="center"
        >
          <HomeButtonCard 
            title={item.title}
            description={item.description}
            to={item.to}
            icon={item.icon}
            bgColor={item.bgColor}
            iconColor={item.iconColor}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default HomeButtonGrid;