import React, { useState } from 'react';
import styled from 'styled-components';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { auth, supabase } from './authy';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
`;

const FormContainer = styled.form`
  width: 100%;
  margin-top: 16px;
`;


export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      console.log("Submitting a request via authy");

      const data = await auth.signInWithEmail(email, password);

      if(!data || !data.user) {
        setError("Invalid login credentials");
        return;
      }

      // Verify admin flag
      const { data: userData, error: fetchError } = await supabase 
        .from('users')
        .select('admin')
        .eq('email', email)
        .single();
      if (fetchError) {
        setError('Error fetching user data: ' + fetchError.message);
        return;
      }
      if (!userData || !userData.admin) {
        setError('Access denied. You do not have admin privileges.');
        await auth.signOut();
        return;
      }
      // Successful login
      setMessage('Welcome back, you have successfully logged in!');
      setEmail('');
      setPassword('');

      setTimeout(() => { navigate('/dashboard'); }, 2000);
    } catch (err) {
      console.log("Auth error: ", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          pt: 8,
        }}
      >
        <StyledPaper elevation={6}>
          <Typography component="h1" variant="h5" gutterBottom>
            Welcome to Make 'Em Now
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Enter your email & password to receive access
          </Typography>

          {message && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormContainer onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Authenticate'}
            </Button>
          </FormContainer>
        </StyledPaper>
      </Box>
    </Container>
  );
};