import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Search,
  Plus,
  Heart,
  Eye,
  ThumbsUp,
  Reply,
  Edit,
  Trash2,
  X,
  Pin,
  CheckCircle,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import forumService from "@/services/ForumService";
import { toast } from "sonner";

const Forums = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: ""
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, searchTerm, sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== "all") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      if (sortBy) params.sort = sortBy;
      
      const data = await forumService.getPosts(params);
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await forumService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleViewPost = async (id) => {
    try {
      const post = await forumService.getPost(id);
      setSelectedPost(post);
    } catch (error) {
      toast.error("Failed to load post");
    }
  };

  const handleCreatePost = async () => {
    try {
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      const postData = {
        ...formData,
        tags: tagsArray
      };
      
      await forumService.createPost(postData);
      toast.success("Post created successfully");
      setShowCreateModal(false);
      setFormData({ title: "", content: "", category: "general", tags: "" });
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create post");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await forumService.likePost(postId);
      fetchPosts();
      if (selectedPost?._id === postId) {
        handleViewPost(postId);
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim() || !selectedPost) return;

    try {
      await forumService.addComment(selectedPost._id, commentContent);
      setCommentContent("");
      handleViewPost(selectedPost._id);
      fetchPosts();
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!selectedPost) return;
    try {
      await forumService.likeComment(selectedPost._id, commentId);
      handleViewPost(selectedPost._id);
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyContent[commentId]?.trim() || !selectedPost) return;

    try {
      await forumService.addReply(selectedPost._id, commentId, replyContent[commentId]);
      setReplyContent({ ...replyContent, [commentId]: "" });
      handleViewPost(selectedPost._id);
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await forumService.deletePost(postId);
      toast.success("Post deleted successfully");
      fetchPosts();
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const categoryLabels = {
    general: "General",
    crops: "Crops",
    livestock: "Livestock",
    equipment: "Equipment",
    market: "Market",
    "pest-disease": "Pest & Disease",
    irrigation: "Irrigation",
    organic: "Organic",
    technology: "Technology",
    help: "Help"
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community Forums</h1>
          <p className="text-muted-foreground mt-2">
            Connect with farmers and share knowledge
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(Boolean).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
                setSortBy("recent");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card
            key={post._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewPost(post._id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar>
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback>
                      {post.author?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.pinned && <Pin className="w-4 h-4 text-primary" />}
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      {post.solved && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Solved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        {categoryLabels[post.category] || post.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(post._id);
                      }}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes?.length || 0}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Post</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="What's on your mind?"
                  rows={8}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., farming, help, question"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>Create Post</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPost.pinned && <Pin className="w-4 h-4 text-primary" />}
                    <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{categoryLabels[selectedPost.category] || selectedPost.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedPost.author?.name}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedPost.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPost(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPost.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Comments Section */}
              <div className="mb-6">
                <h4 className="font-medium mb-4">Comments ({selectedPost.comments?.length || 0})</h4>
                <ScrollArea className="h-96 border rounded-lg p-4">
                  <div className="space-y-6">
                    {selectedPost.comments?.map((comment) => (
                      <div key={comment._id} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={comment.author?.avatar} />
                            <AvatarFallback>
                              {comment.author?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{comment.content}</p>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleLikeComment(comment._id)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {comment.likes?.length || 0}
                              </button>
                              <button
                                onClick={() => {
                                  const current = replyContent[comment._id] || "";
                                  setReplyContent({ ...replyContent, [comment._id]: current ? "" : "" });
                                }}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                              >
                                <Reply className="w-3 h-3" />
                                Reply
                              </button>
                            </div>
                            
                            {/* Reply Input */}
                            {replyContent[comment._id] !== undefined && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  value={replyContent[comment._id] || ""}
                                  onChange={(e) =>
                                    setReplyContent({ ...replyContent, [comment._id]: e.target.value })
                                  }
                                  placeholder="Write a reply..."
                                  className="text-sm"
                                  onKeyPress={(e) =>
                                    e.key === "Enter" && handleAddReply(comment._id)
                                  }
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddReply(comment._id)}
                                >
                                  <Reply className="w-3 h-3" />
                                </Button>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 ml-6 space-y-2 border-l-2 pl-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply._id} className="flex items-start gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={reply.author?.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {reply.author?.name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-xs">{reply.author?.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-xs">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 mb-4">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end mb-4">
                <Button onClick={handleAddComment}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePost(selectedPost._id)}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Heart className="w-5 h-5" />
                    <span>{selectedPost.likes?.length || 0} likes</span>
                  </button>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-5 h-5" />
                    {selectedPost.views} views
                  </span>
                </div>
                {(selectedPost.author?._id === user?.id || user?.role === "admin") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(selectedPost._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Forums;

