import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projectName, setProjectName] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // In the future, this is where you call your backend API.
    // For now, we simulate a successful login/signup.
    const mockUser = {
      id: 'usr_123',
      name: email.split('@')[0],
      email: email,
      role: tab === 1 ? 'admin' : 'engineer',
      projectId: 'proj_123'
    };
    
    login(mockUser);
    navigate('/');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            🛡️ SentinelX
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Log Monitoring & Alerting Platform
          </Typography>

          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth" sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Create Project" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField
                fullWidth
                label="Project Name"
                variant="outlined"
                margin="normal"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              sx={{ mt: 3, mb: 2 }}
            >
              {tab === 0 ? 'Sign In' : 'Sign Up & Create Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
