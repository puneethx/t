import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarGroup,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Group,
  Public,
  Lock,
  LocationOn,
  Send,
  ExitToApp,
  ContentCopy,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import axios from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newPost, setNewPost] = useState('');
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { data: group, isLoading, error } = useQuery(
    ['group', id],
    async () => {
      const response = await axios.get(`/api/v1/groups/${id}`);
      return response.data.group;
    }
  );

  const isMember = group?.members?.some(member => member.user._id === user?._id);
  const isCreator = group?.creator._id === user?._id;

  const { data: messagesData, refetch: refetchMessages } = useQuery(
    ['groupMessages', id],
    async () => {
      const response = await axios.get(`/api/v1/groups/${id}/messages`);
      return response.data;
    },
    {
      enabled: !!group && isMember,
      refetchInterval: 3000 // Refetch every 3 seconds for real-time feel
    }
  );

  const addPostMutation = useMutation(
    async (content) => {
      await axios.post(`/api/v1/groups/${id}/posts`, { content });
    },
    {
      onSuccess: () => {
        setNewPost('');
        queryClient.invalidateQueries(['group', id]);
      }
    }
  );

  const sendMessageMutation = useMutation(
    async (content) => {
      await axios.post(`/api/v1/groups/${id}/messages`, { content });
    },
    {
      onSuccess: () => {
        setNewMessage('');
        refetchMessages();
      }
    }
  );

  const leaveGroupMutation = useMutation(
    async () => {
      await axios.post(`/api/v1/groups/${id}/leave`);
    },
    {
      onSuccess: () => {
        navigate('/groups');
      }
    }
  );

  const handleAddPost = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      addPostMutation.mutate(newPost.trim());
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
      setTimeout(scrollToBottom, 100);
    }
  }, [messagesData]);

  const handleLeaveGroup = () => {
    leaveGroupMutation.mutate();
    setLeaveDialogOpen(false);
  };

  const copyInviteCode = () => {
    if (group.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading group details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.response?.data?.error || 'Failed to load group details'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            {group.name}
          </Typography>
          {group.isPublic ? (
            <Public color="success" />
          ) : (
            <Lock color="action" />
          )}
        </Box>
        
        {group.description && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {group.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {isMember && !isCreator && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<ExitToApp />}
              onClick={() => setLeaveDialogOpen(true)}
            >
              Leave Group
            </Button>
          )}
          {!group.isPublic && group.inviteCode && (
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={copyInviteCode}
            >
              Copy Invite Code
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Tab Navigation */}
          {isMember && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant={activeTab === 'posts' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('posts')}
                sx={{ mr: 2 }}
              >
                Group Posts
              </Button>
              <Button
                variant={activeTab === 'chat' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('chat')}
                startIcon={<ChatIcon />}
              >
                Group Chat
              </Button>
            </Box>
          )}
          {/* Group Posts */}
          {(!isMember || activeTab === 'posts') && (
            <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Group Posts
              </Typography>

              {/* Add Post Form */}
              {isMember && (
                <Box component="form" onSubmit={handleAddPost} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Share something with the group..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={!newPost.trim() || addPostMutation.isLoading}
                  >
                    {addPostMutation.isLoading ? 'Posting...' : 'Post'}
                  </Button>
                </Box>
              )}

              <Divider sx={{ mb: 3 }} />

              {/* Posts List */}
              {group.posts?.length > 0 ? (
                <List>
                  {group.posts.map((post) => (
                    <ListItem key={post._id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {post.author.firstName} {post.author.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(post.createdAt), 'MMM dd, yyyy • h:mm a')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {post.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No posts yet. {isMember ? 'Be the first to share something!' : 'Join the group to see posts.'}
                </Typography>
              )}
            </CardContent>
          </Card>
          )}

          {/* Group Chat */}
          {isMember && activeTab === 'chat' && (
            <Card sx={{ mb: 4, height: '600px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Group Chat
                  </Typography>
                </Box>

                {/* Messages Container */}
                <Box 
                  ref={chatContainerRef}
                  sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isOwnMessage = message.sender._id === user?._id;
                      return (
                        <Box
                          key={message._id}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              maxWidth: '70%',
                              backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                              color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                              borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                            }}
                          >
                            {!isOwnMessage && (
                              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                {message.sender.firstName} {message.sender.lastName}
                              </Typography>
                            )}
                            <Typography variant="body1">
                              {message.content}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                              {format(new Date(message.createdAt), 'h:mm a')}
                            </Typography>
                          </Paper>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendMessageMutation.isLoading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="submit"
                              disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                              color="primary"
                            >
                              <Send />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Group Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Group Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Members
                  </Typography>
                  <Typography variant="body2">
                    {group.members?.length || 0} / {group.maxMembers}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(group.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Privacy
                  </Typography>
                  <Chip
                    label={group.isPublic ? 'Public' : 'Private'}
                    color={group.isPublic ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Members ({group.members?.length || 0})
              </Typography>
              <List dense>
                {group.members?.map((member) => (
                  <ListItem key={member.user._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {member.user.firstName[0]}{member.user.lastName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${member.user.firstName} ${member.user.lastName}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={member.role}
                            size="small"
                            color={member.role === 'admin' ? 'primary' : 'default'}
                          />
                          {member.user._id === group.creator && (
                            <Chip label="Creator" size="small" color="secondary" />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Related Content */}
          {(group.destination || group.plannedTrip) && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Related Content
                </Typography>
                {group.destination && (
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                    onClick={() => navigate(`/destinations/${group.destination._id}`)}
                  >
                    View Destination: {group.destination.title}
                  </Button>
                )}
                {group.plannedTrip && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/itineraries/${group.plannedTrip._id}`)}
                  >
                    View Trip: {group.plannedTrip.title}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Leave Group Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Leave Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this group? You'll need an invitation to rejoin if it's private.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLeaveGroup}
            color="error"
            variant="contained"
            disabled={leaveGroupMutation.isLoading}
          >
            {leaveGroupMutation.isLoading ? 'Leaving...' : 'Leave Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupDetail;
