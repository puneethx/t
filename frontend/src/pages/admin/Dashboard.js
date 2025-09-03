import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import {
  People,
  LocationOn,
  Route,
  Group,
  Star,
  TrendingUp,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery(
    'adminStats',
    async () => {
      const response = await axios.get('/api/v1/admin/stats');
      return response.data;
    }
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <People />,
      color: 'primary',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Destinations',
      value: stats?.totalDestinations || 0,
      icon: <LocationOn />,
      color: 'success',
      action: () => navigate('/admin/destinations'),
    },
    {
      title: 'Trip Itineraries',
      value: stats?.totalItineraries || 0,
      icon: <Route />,
      color: 'info',
      action: () => navigate('/admin/itineraries'),
    },
    {
      title: 'Travel Groups',
      value: stats?.totalGroups || 0,
      icon: <Group />,
      color: 'warning',
      action: () => navigate('/admin/groups'),
    },
    {
      title: 'Reviews',
      value: stats?.totalReviews || 0,
      icon: <Star />,
      color: 'secondary',
      action: () => navigate('/admin/reviews'),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your TravelTrove platform
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Recent Activity
            </Typography>
            {stats?.recentActivity?.length > 0 ? (
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <ListItem key={index} divider={index < stats.recentActivity.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <TrendingUp />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No recent activity to display.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<LocationOn />}
                onClick={() => navigate('/admin/destinations/create')}
                fullWidth
              >
                Add New Destination
              </Button>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/admin/users')}
                fullWidth
              >
                Manage Users
              </Button>
              <Button
                variant="outlined"
                startIcon={<Star />}
                onClick={() => navigate('/admin/reviews')}
                fullWidth
              >
                Moderate Reviews
              </Button>
              <Button
                variant="outlined"
                startIcon={<Group />}
                onClick={() => navigate('/admin/groups')}
                fullWidth
              >
                Manage Groups
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              System Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label="Database"
                    color="success"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Connected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label="API Server"
                    color="success"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Running
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label="Authentication"
                    color="success"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label="File Storage"
                    color="warning"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Configure Cloudinary
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
