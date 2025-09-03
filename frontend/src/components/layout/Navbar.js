import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Explore,
  Map,
  Group,
  Favorite,
  Person,
  AdminPanelSettings,
  Logout,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Destinations', path: '/destinations', icon: <Explore /> },
    { text: 'Itineraries', path: '/itineraries', icon: <Map /> },
  ];

  const userMenuItems = isAuthenticated
    ? [
        { text: 'Groups', path: '/groups', icon: <Group /> },
        { text: 'Favorites', path: '/favorites', icon: <Favorite /> },
        { text: 'Profile', path: '/profile', icon: <Person /> },
      ]
    : [];

  const adminMenuItems =
    user?.role === 'admin'
      ? [{ text: 'Admin Dashboard', path: '/admin', icon: <AdminPanelSettings /> }]
      : [];

  const allMenuItems = [...navigationItems, ...userMenuItems, ...adminMenuItems];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            TravelTrove
          </Typography>
        </ListItem>
        {allMenuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              color: location.pathname === item.path ? 'primary.main' : 'inherit',
              backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {!isAuthenticated && (
          <>
            <ListItem component={Link} to="/login" onClick={handleDrawerToggle}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem component={Link} to="/register" onClick={handleDrawerToggle}>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
        {isAuthenticated && (
          <ListItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            TravelTrove
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{
                    textDecoration: location.pathname === item.path ? 'underline' : 'none',
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {isAuthenticated ? (
                <>
                  {userMenuItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      sx={{
                        textDecoration: location.pathname === item.path ? 'underline' : 'none',
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}

                  {user?.role === 'admin' && (
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin"
                      sx={{
                        textDecoration: location.pathname.startsWith('/admin') ? 'underline' : 'none',
                      }}
                    >
                      Admin
                    </Button>
                  )}

                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {user?.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                    component={Link}
                    to="/register"
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
