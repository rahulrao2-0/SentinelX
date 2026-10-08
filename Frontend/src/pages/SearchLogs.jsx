import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Paper, 
  InputAdornment, 
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha
} from '@mui/material';
import { Search as SearchIcon, AutoAwesome as AiIcon } from '@mui/icons-material';

const mockLogs = [
  { id: '1', level: 'error', message: 'Database connection failed', service: 'payment-service', time: '10:42:01.234 AM' },
  { id: '2', level: 'info', message: 'User authenticated successfully', service: 'auth-service', time: '10:41:55.102 AM' },
  { id: '3', level: 'warn', message: 'Memory usage exceeded 85%', service: 'order-service', time: '10:40:12.890 AM' },
  { id: '4', level: 'error', message: 'NullPointerException in OrderProcessor', service: 'order-service', time: '10:39:45.001 AM' },
];

export default function SearchLogs() {
  const [query, setQuery] = useState('');

  const getLevelColor = (level) => {
    switch(level) {
      case 'error': return 'error';
      case 'warn': return 'warning';
      default: return 'success';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Natural Language Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Describe what you're looking for, and our AI will translate it into an Elasticsearch query.
        </Typography>
      </Box>
      
      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="e.g., 'Show me payment errors from the last hour'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
              transition: 'all 0.3s',
              '&.Mui-focused': {
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              '& input': { p: 2.5, fontSize: '1.1rem' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ pl: 1 }}>
                <AiIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ pr: 1 }}>
                <IconButton 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: '#fff',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Recent Logs
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{log.time}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.level.toUpperCase()} 
                    color={getLevelColor(log.level)} 
                    size="small"
                    sx={{ fontWeight: 'bold', borderRadius: 1.5, px: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ bgcolor: 'rgba(255,255,255,0.05)', display: 'inline-block', px: 1, py: 0.5, borderRadius: 1 }}>
                    {log.service}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
