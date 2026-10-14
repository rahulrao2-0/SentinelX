import React, { useState } from 'react';
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
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  alpha 
} from '@mui/material';
import { Add as AddIcon, Code as CodeIcon, NotificationsActive } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Mock rules matching the 'alert_rules' table:
// (id, project_id, name, target_service, log_level, threshold_count, time_window_minutes, is_active)
const initialRules = [
  { 
    id: 'rule_1', 
    project_id: 'proj_localmart_101', 
    name: 'High Error Rate', 
    target_service: null, // NULL = all services
    log_level: 'error', 
    threshold_count: 50, 
    time_window_minutes: 5, 
    is_active: true 
  },
  { 
    id: 'rule_2', 
    project_id: 'proj_localmart_101', 
    name: 'DB Connection Timeout', 
    target_service: 'payment-service', 
    log_level: 'error', 
    threshold_count: 5, 
    time_window_minutes: 1, 
    is_active: true 
  },
  { 
    id: 'rule_3', 
    project_id: 'proj_localmart_101', 
    name: 'Spike in 500 Responses', 
    target_service: 'api-gateway', 
    log_level: 'warn', 
    threshold_count: 100, 
    time_window_minutes: 10, 
    is_active: false 
  },
];

export default function Alerts() {
  const { user } = useAuth();
  const [rules, setRules] = useState(initialRules);
  const [openDialog, setOpenDialog] = useState(false);

  // New Rule Form matching table columns
  const [name, setName] = useState('');
  const [targetService, setTargetService] = useState('');
  const [logLevel, setLogLevel] = useState('error');
  const [thresholdCount, setThresholdCount] = useState(25);
  const [timeWindowMinutes, setTimeWindowMinutes] = useState(5);

  const handleToggle = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    const newRule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 8),
      project_id: user?.projectId || 'proj_localmart_101',
      name: name.trim(),
      target_service: targetService.trim() ? targetService.trim() : null,
      log_level: logLevel,
      threshold_count: Number(thresholdCount),
      time_window_minutes: Number(timeWindowMinutes),
      is_active: true
    };

    setRules([newRule, ...rules]);
    setOpenDialog(false);
    setName('');
    setTargetService('');
    setLogLevel('error');
    setThresholdCount(25);
    setTimeWindowMinutes(5);
  };

  const getColorByLevel = (level) => {
    if (level === 'error') return 'error';
    if (level === 'warn') return 'warning';
    return 'info';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Alert Rules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configured triggers mapped to the <code>alert_rules</code> table in MySQL.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ py: 1, px: 3, borderRadius: 2 }}
        >
          Create Rule
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rules.map((rule) => {
          const color = getColorByLevel(rule.log_level);
          return (
            <Grid item xs={12} md={6} lg={4} key={rule.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                transition: 'all 0.2s', 
                borderTop: `4px solid`, 
                borderColor: rule.is_active ? `${color}.main` : 'divider', 
                opacity: rule.is_active ? 1 : 0.65, 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' } 
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1.5, 
                        bgcolor: (theme) => alpha(theme.palette[color].main, 0.15), 
                        color: `${color}.main`, 
                        display: 'flex' 
                      }}>
                        <NotificationsActive fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {rule.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rule ID: <code>{rule.id}</code>
                        </Typography>
                      </Box>
                    </Box>
                    <Switch 
                      checked={rule.is_active} 
                      onChange={() => handleToggle(rule.id)} 
                      color="primary" 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<CodeIcon fontSize="small" />} 
                      label={rule.target_service ? rule.target_service : 'All Services (NULL)'} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} 
                    />
                    <Chip 
                      label={`Level: ${rule.log_level}`} 
                      size="small" 
                      color={color} 
                      variant="outlined" 
                      sx={{ borderRadius: 1 }} 
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
                    color: rule.is_active ? 'primary.light' : 'text.disabled' 
                  }}>
                    IF count &gt;= {rule.threshold_count} in {rule.time_window_minutes} min window
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Rule Modal mapped to alert_rules table */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Create New Alert Rule
        </DialogTitle>
        <form onSubmit={handleCreateRule}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Parameters mapped directly to <code>alert_rules</code> columns in MySQL.
            </Typography>

            <TextField
              label="Rule Name (name)"
              placeholder="e.g., High Error Rate"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Target Service (target_service)"
              placeholder="e.g., payment-service (Leave empty for NULL / All Services)"
              helperText="Specific service or leave empty for all microservices"
              fullWidth
              value={targetService}
              onChange={(e) => setTargetService(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Log Level (log_level)</InputLabel>
              <Select
                value={logLevel}
                label="Log Level (log_level)"
                onChange={(e) => setLogLevel(e.target.value)}
              >
                <MenuItem value="error">error</MenuItem>
                <MenuItem value="warn">warn</MenuItem>
                <MenuItem value="info">info</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Threshold Count (threshold_count)"
                  type="number"
                  required
                  fullWidth
                  value={thresholdCount}
                  onChange={(e) => setThresholdCount(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Time Window Minutes (time_window_minutes)"
                  type="number"
                  required
                  fullWidth
                  value={timeWindowMinutes}
                  onChange={(e) => setTimeWindowMinutes(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Rule
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
