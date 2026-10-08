import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Divider,
  Chip,
  alpha
} from '@mui/material';
import { Send as SendIcon, FiberManualRecord as LiveIcon, CheckCircle as ResolveIcon, AutoFixHigh as AiIcon } from '@mui/icons-material';

const mockChat = [
  { id: 1, user: 'SentinelX AI', initial: 'AI', message: 'Anomaly detected: Database connection failures spiked by 500% in the last 2 minutes. Alerting on-call.', time: '14:02', isAi: true },
  { id: 2, user: 'Alice (DevOps)', initial: 'A', message: 'I see the alert. Looks like the DB connection pool is exhausted.', time: '14:03', isAi: false },
  { id: 3, user: 'Bob (Backend)', initial: 'B', message: 'Checking the config now. Did someone push a change?', time: '14:04', isAi: false },
];

export default function DebugRoom() {
  const [chatInput, setChatInput] = useState('');
  
  const formatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : new Date();
    const time = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ms = d.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  const [liveLogs, setLiveLogs] = useState([
    { id: 0, time: formatTime(), text: 'Waiting for incoming logs...', error: false }
  ]);
  const chatEndRef = useRef(null);
  const logEndRef = useRef(null);
  
  // The invisible queue that holds logs arriving instantly from the backend
  const logQueue = useRef([]);

  // Auto-scroll chat and logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLogs, chatInput]);

  // Dynamic Render Loop: Adjusts speed and batch size based on queue length
  useEffect(() => {
    let timeoutId;

    const renderLoop = () => {
      const qLen = logQueue.current.length;
      
      if (qLen > 0) {
        let delay = 30; // default delay
        let batchSize = 1;

        if (qLen > 2000) {
          delay = 5;      // super fast delay
          batchSize = 10; // process multiple logs at once to clear huge backlog
        } else if (qLen > 500) {
          delay = 10;     // faster delay
          batchSize = 2;  // process couple logs at once
        } else if (qLen < 100) {
          delay = 100;    // slower delay
          batchSize = 1;
        }

        const nextLogs = logQueue.current.splice(0, batchSize);
        
        setLiveLogs((prevLogs) => {
          const updatedLogs = [...prevLogs, ...nextLogs];
          // Keep only the last 150 logs in the DOM so the browser doesn't freeze!
          if (updatedLogs.length > 150) {
            return updatedLogs.slice(-150);
          }
          return updatedLogs;
        });

        timeoutId = setTimeout(renderLoop, delay);
      } else {
        // Wait and check again if queue is empty
        timeoutId = setTimeout(renderLoop, 100);
      }
    };

    renderLoop();

    return () => clearTimeout(timeoutId);
  }, []);

  // Socket.io connection
  useEffect(() => {
    const socket = io('http://localhost:3000'); // Connect to Node.js backend

    socket.on('connect', () => {
      console.log('Connected to SentinelX Live Stream');
    });

    // Listen for the event emitted by Kafka Consumer
    socket.on('new_log', (logData) => {
      // Instantly push to our invisible queue, NOT directly to React state
      logQueue.current.push({
        id: Math.random().toString(36).substring(2, 10), // Unique ID
        time: formatTime(logData.timestamp || logData.receivedAt), 
        text: `[${logData.service || 'unknown-service'}] ${logData.message}`, 
        error: logData.level === 'error' 
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Incident: Database Connection Timeout
            </Typography>
            <Chip 
              icon={<LiveIcon sx={{ fontSize: '14px !important', animation: 'pulse 2s infinite' }} />} 
              label="LIVE" 
              color="error" 
              size="small" 
              sx={{ fontWeight: 'bold', px: 1, '& .MuiChip-icon': { color: '#fff' } }} 
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Room ID: #room_789 • 2 Engineers Online
          </Typography>
        </Box>
        <IconButton 
          sx={{ 
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), 
            color: 'success.main',
            borderRadius: 2,
            px: 2,
            gap: 1,
            '&:hover': { bgcolor: (theme) => alpha(theme.palette.success.main, 0.2) }
          }}
        >
          <ResolveIcon />
          <Typography variant="button">Mark Resolved</Typography>
        </IconButton>
      </Box>

      {/* FULL WIDTH LIVE LOGS */}
      <Paper 
        sx={{ 
          flexGrow: 1,
          width: '100%',
          bgcolor: '#050a12', // Extra dark for terminal
          color: '#a9b7c6', 
          fontFamily: '"Fira Code", monospace',
          p: 3,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ borderBottom: '1px dashed #333', pb: 1, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#5c9ea9', fontFamily: 'inherit', fontSize: '0.9rem' }}>
            sentinel-stream-connected [ws://logs.sentinelx.io:443]
          </Typography>
          <Typography variant="caption" sx={{ color: '#4caf50', fontFamily: 'inherit', fontSize: '0.9rem' }}>
            ● receiving
          </Typography>
        </Box>
        
        {liveLogs.map((log) => (
          <Box key={log.id} sx={{ mb: 1, display: 'flex', gap: 3, fontFamily: 'inherit', fontSize: '1.1rem', lineHeight: 1.6 }}>
            <Typography component="span" sx={{ color: '#555', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
              {log.time}
            </Typography>
            <Typography component="span" sx={{ 
              color: log.error ? '#ff5252' : '#a9b7c6',
              fontFamily: 'inherit',
              wordBreak: 'break-all'
            }}>
              {log.text}
            </Typography>
          </Box>
        ))}
        <div ref={logEndRef} />
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Typography component="span" sx={{ color: '#555', animation: 'pulse 1.5s infinite', fontSize: '1.2rem' }}>
            _
          </Typography>
        </Box>
      </Paper>
      
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
}
