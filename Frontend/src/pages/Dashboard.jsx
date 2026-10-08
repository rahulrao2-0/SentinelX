import React from 'react';
import { Typography, Grid, Card, CardContent, Box, alpha } from '@mui/material';
import { 
  Memory as CpuIcon, 
  WarningAmber as WarningIcon, 
  ShowChart as ChartIcon 
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ 
    height: '100%', 
    position: 'relative', 
    overflow: 'hidden',
    '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
  }}>
    <Box sx={{ 
      position: 'absolute', 
      top: -20, 
      right: -20, 
      opacity: 0.1, 
      transform: 'scale(3)',
      color: color 
    }}>
      {icon}
    </Box>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.15),
          color: `${color}.main`,
          display: 'flex'
        }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time metrics and system health at a glance.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Logs Processed (24h)" 
            value="1.2M" 
            icon={<CpuIcon />} 
            color="primary" 
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Active Alerts" 
            value="3" 
            icon={<WarningIcon />} 
            color="error" 
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Avg Error Rate" 
            value="0.14%" 
            icon={<ChartIcon />} 
            color="warning" 
          />
        </Grid>
      </Grid>
    </Box>
  );
}
