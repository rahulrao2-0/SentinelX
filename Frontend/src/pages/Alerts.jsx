import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Switch,
  Divider,
  alpha
} from '@mui/material';
import { Add as AddIcon, Code as CodeIcon, NotificationsActive } from '@mui/icons-material';

const mockRules = [
  { id: 1, name: 'High Error Rate', service: 'All Services', condition: '> 50 errors / 5 min', active: true, color: 'error' },
  { id: 2, name: 'DB Connection Timeout', service: 'payment-service', condition: '> 5 errors / 1 min', active: true, color: 'warning' },
  { id: 3, name: 'Spike in 500 Responses', service: 'api-gateway', condition: '> 100 errors / 10 min', active: false, color: 'info' },
];

export default function Alerts() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Alert Rules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure automated alerts based on log patterns and anomalies.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ py: 1, px: 3, borderRadius: 2 }}
        >
          Create Rule
        </Button>
      </Box>

      <Grid container spacing={3}>
        {mockRules.map((rule) => (
          <Grid item xs={12} md={6} lg={4} key={rule.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.2s',
              borderTop: `4px solid`,
              borderColor: rule.active ? `${rule.color}.main` : 'divider',
              opacity: rule.active ? 1 : 0.7,
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      p: 1, borderRadius: 1.5, 
                      bgcolor: (theme) => alpha(theme.palette[rule.color].main, 0.15),
                      color: `${rule.color}.main`,
                      display: 'flex'
                    }}>
                      <NotificationsActive fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {rule.name}
                    </Typography>
                  </Box>
                  <Switch defaultChecked={rule.active} color="primary" />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    icon={<CodeIcon fontSize="small" />} 
                    label={rule.service} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} 
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Trigger Condition
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace', 
                  mt: 1, 
                  bgcolor: 'rgba(0,0,0,0.3)', 
                  p: 1.5, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  color: rule.active ? 'primary.light' : 'text.disabled'
                }}>
                  IF {rule.condition}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
