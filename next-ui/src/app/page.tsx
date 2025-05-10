'use client';
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';


export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectname: '',
    ansible_login: '',
    ansible_password: '',
    projectId: '3',
    external_server_port: '',
    deploy_server_ip: '192.168.50.230',
    deploy_target: 'prod',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOutput('');
    setIsDialogOpen(true);
    
    // Sanitize form data
    const sanitizedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        String(value).toLowerCase().replace(/[_ ]/g, '-')
      ])
    );

    try {
      const response = await fetch('/api/ansible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedFormData),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const newData = line.slice(6);
            setOutput(prev => prev + newData);
          }
        }
      }
    } catch (error: any) {
      setOutput(prev => prev + '\nError: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Project Configuration
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Project Name"
              name="projectname"
              value={formData.projectname}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ansible Login"
              name="ansible_login"
              value={formData.ansible_login}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Ansible Password"
              name="ansible_password"
              value={formData.ansible_password}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              margin="normal"
              label="External Server Port"
              name="external_server_port"
              value={formData.external_server_port}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Deploy Server IP"
              name="deploy_server_ip"
              value={formData.deploy_server_ip}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ansible Project ID"
              name="projectId"
              type="number"
              value={formData.projectId}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Deploy Target"
              name="deploy_target"
              value={formData.deploy_target}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </Paper>
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={() => {}}
        disableEscapeKeyDown
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            Ansible Output
            {isLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
          </div>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ minWidth: 'auto', p: 0.5 }}>
            ✕
          </Button>
        </DialogTitle>
        <DialogContent>
          <Paper 
            sx={{ 
              p: 2, 
              bgcolor: '#000',
              color: '#fff',
              maxHeight: '70vh',
              overflow: 'auto',
              fontFamily: 'monospace'
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
          </Paper>
        </DialogContent>
      </Dialog>
    </Container>
  );
}