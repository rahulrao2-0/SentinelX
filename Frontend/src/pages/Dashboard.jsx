import React, { useState } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Chip, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  alpha 
} from '@mui/material';
import { 
  Memory as CpuIcon, 
  WarningAmber as WarningIcon, 
  ShowChart as ChartIcon, 
  CheckCircle as ResolvedIcon,
  Error as ActiveIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

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

// Mock incidents matching the 'incidents' table:
// (id, project_id, rule_id, status, triggered_at, resolved_at, postmortem_notes)
const initialIncidents = [
  {
    id: 'inc_8492',
    project_id: 'proj_localmart_101',
    rule_id: 'rule_1',
    rule_name: 'High Error Rate',
    status: 'active',
    triggered_at: '2026-10-12 18:35:10',
    resolved_at: null,
    postmortem_notes: null
  },
  {
    id: 'inc_8485',
    project_id: 'proj_localmart_101',
    rule_id: 'rule_2',
    rule_name: 'DB Connection Timeout',
    status: 'active',
    triggered_at: '2026-10-12 17:12:04',
    resolved_at: null,
    postmortem_notes: null
  },
  {
    id: 'inc_8420',
    project_id: 'proj_localmart_101',
    rule_id: 'rule_3',
    rule_name: 'Spike in 500 Responses',
    status: 'resolved',
    triggered_at: '2026-10-11 14:02:11',
    resolved_at: '2026-10-11 14:45:00',
    postmortem_notes: 'Restarted API gateway pod after transient memory leak under high burst load.'
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState(initialIncidents);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [postmortemNotes, setPostmortemNotes] = useState('');

  const activeCount = incidents.filter(i => i.status === 'active').length;

  const handleOpenResolve = (incident) => {
    setSelectedIncident(incident);
    setPostmortemNotes('');
    setResolveDialogOpen(true);
  };

  const handleConfirmResolve = () => {
    if (!selectedIncident) return;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncident.id) {
        return {
          ...inc,
          status: 'resolved',
          resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          postmortem_notes: postmortemNotes.trim() || 'Resolved by ' + (user?.name || 'Engineer')
        };
      }
      return inc;
    }));

    setResolveDialogOpen(false);
    setSelectedIncident(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            System Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Live telemetry & incident status for project: <strong>{user?.projectName || 'Local Mart'}</strong> (<code>{user?.projectId || 'proj_localmart_101'}</code>)
          </Typography>
        </Box>
        <Chip 
          label={`Role: ${user?.role || 'engineer'}`} 
          color={user?.role === 'admin' ? 'primary' : 'default'} 
          sx={{ fontWeight: 600, textTransform: 'uppercase' }}
        />
      </Box>
      
      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Logs Ingested (24h)" 
            value="1.2M" 
            icon={<CpuIcon />} 
            color="primary" 
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Active Incidents" 
            value={activeCount.toString()} 
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

      {/* Incidents Section mapped to MySQL 'incidents' table */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Incidents Log
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Records mapped to the <code>incidents</code> table (foreign keys to <code>projects</code> and <code>alert_rules</code>).
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Incident ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Triggered Rule (rule_id)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Triggered At</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Resolved At / Postmortem</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell>
                    <code>{incident.id}</code>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {incident.rule_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <code>{incident.rule_id}</code>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {incident.status === 'active' ? (
                      <Chip 
                        icon={<ActiveIcon fontSize="small" />} 
                        label="Active" 
                        color="error" 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip 
                        icon={<ResolvedIcon fontSize="small" />} 
                        label="Resolved" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {incident.triggered_at}
                  </TableCell>
                  <TableCell>
                    {incident.status === 'resolved' ? (
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', color: 'success.main', fontWeight: 600 }}>
                          Resolved: {incident.resolved_at}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {incident.postmortem_notes}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        Pending resolution...
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {incident.status === 'active' ? (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="warning"
                        onClick={() => handleOpenResolve(incident)}
                      >
                        Resolve
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Completed
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Resolve Incident Dialog (updating resolved_at and postmortem_notes) */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Resolve Incident: {selectedIncident?.id}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Provide resolution notes to update <code>postmortem_notes</code> and set <code>resolved_at</code> timestamp.
          </Typography>
          <TextField
            label="Postmortem Notes (postmortem_notes)"
            multiline
            rows={4}
            fullWidth
            placeholder="Explain root cause and mitigation (e.g., patched pool exhaustion, rolled back v1.2.4)..."
            value={postmortemNotes}
            onChange={(e) => setPostmortemNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResolveDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={handleConfirmResolve}>
            Mark Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
