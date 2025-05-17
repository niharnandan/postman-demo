import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ width: '100%' }}>
      <Toolbar sx={{ maxWidth: '1200px', width: '100%', mx: 'auto' }}>
        <CodeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          API Generator
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
