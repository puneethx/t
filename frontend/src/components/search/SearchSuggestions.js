import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
  Chip,
  Fade,
  Divider,
} from '@mui/material';
import { LocationOn, Star } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/api';

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchSuggestions = ({ searchQuery, onSuggestionClick, maxResults = 5 }) => {
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: suggestions, isLoading, error } = useQuery(
    ['searchSuggestions', debouncedSearchQuery],
    async () => {
      if (!debouncedSearchQuery.trim()) return [];
      
      const response = await axios.get('/api/v1/destination-guides', {
        params: {
          search: debouncedSearchQuery,
          limit: maxResults,
        }
      });
      return response.data.destinationGuides || [];
    },
    {
      enabled: !!debouncedSearchQuery.trim(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const handleSuggestionClick = useCallback((destination) => {
    if (onSuggestionClick) {
      onSuggestionClick(destination);
    }
    navigate(`/destinations/${destination._id}`);
  }, [navigate, onSuggestionClick]);

  // Don't show suggestions if no search query
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <Fade in={!!searchQuery.trim()}>
      <Paper
        elevation={16}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 99999,
          maxHeight: 400,
          overflow: 'auto',
          mt: 1,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {isLoading && (
          <Box sx={{ p: 2 }}>
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="rectangular" width={80} height={60} sx={{ mr: 2, borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              Error loading suggestions
            </Typography>
          </Box>
        )}

        {!isLoading && !error && suggestions && suggestions.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No destinations found for "{searchQuery}"
            </Typography>
          </Box>
        )}

        {!isLoading && !error && suggestions && suggestions.length > 0 && (
          <List sx={{ p: 0 }}>
            {suggestions.map((destination, index) => (
              <React.Fragment key={destination._id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSuggestionClick(destination)}
                    sx={{
                      py: 2,
                      px: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={destination.photos?.[0]?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=80&h=60&fit=crop'}
                        alt={destination.title}
                        sx={{
                          width: 80,
                          height: 60,
                          mr: 2,
                          borderRadius: 1,
                        }}
                      />
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {destination.title}
                          </Typography>
                          {destination.averageRating > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="caption" color="text.secondary">
                                {destination.averageRating.toFixed(1)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {destination.location.city}, {destination.location.country}
                            </Typography>
                          </Box>
                          
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1,
                            }}
                          >
                            {destination.summary || destination.content?.overview || 'Discover this amazing destination'}
                          </Typography>
                          
                          {destination.tags && destination.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {destination.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 20,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < suggestions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            
            {suggestions.length >= maxResults && (
              <>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`)}
                      >
                        View all results for "{searchQuery}"
                      </Typography>
                    }
                  />
                </ListItem>
              </>
            )}
          </List>
        )}
      </Paper>
    </Fade>
  );
};

export default SearchSuggestions;
