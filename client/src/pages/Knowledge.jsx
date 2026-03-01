import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Heart, 
  Eye, 
  Edit, 
  Trash2,
  X,
  Calendar,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import knowledgeService from "@/services/KnowledgeService";
import { toast } from "sonner";

const Knowledge = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: ""
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== "all") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const data = await knowledgeService.getArticles(params);
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await knowledgeService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCreateArticle = async () => {
    try {
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      const articleData = {
        ...formData,
        tags: tagsArray
      };
      
      await knowledgeService.createArticle(articleData);
      toast.success("Article created successfully");
      setShowCreateModal(false);
      setFormData({ title: "", content: "", category: "general", tags: "" });
      fetchArticles();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create article");
    }
  };

  const handleLike = async (articleId) => {
    try {
      await knowledgeService.likeArticle(articleId);
      fetchArticles();
    } catch (error) {
      toast.error("Failed to like article");
    }
  };

  const handleViewArticle = async (articleId) => {
    try {
      const article = await knowledgeService.getArticle(articleId);
      setSelectedArticle(article);
    } catch (error) {
      toast.error("Failed to load article");
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    
    try {
      await knowledgeService.deleteArticle(articleId);
      toast.success("Article deleted successfully");
      fetchArticles();
      if (selectedArticle?._id === articleId) {
        setSelectedArticle(null);
      }
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  const canCreate = user?.role === "officer" || user?.role === "admin";
  const categoryLabels = {
    crops: "Crops",
    livestock: "Livestock",
    "pest-control": "Pest Control",
    irrigation: "Irrigation",
    "soil-management": "Soil Management",
    "organic-farming": "Organic Farming",
    technology: "Technology",
    "market-tips": "Market Tips",
    general: "General"
  };

  if (loading && articles.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Access agricultural knowledge and best practices
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
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
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card
            key={article._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewArticle(article._id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                {article.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{categoryLabels[article.category] || article.category}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.author?.name}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {article.content}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(article._id);
                    }}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Heart className="w-4 h-4" />
                    {article.likes?.length || 0}
                  </button>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {articles.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Article</CardTitle>
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
                  placeholder="Enter article title"
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
                  placeholder="Enter article content"
                  rows={10}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., farming, crops, irrigation"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateArticle}>Create Article</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{selectedArticle.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{categoryLabels[selectedArticle.category] || selectedArticle.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedArticle.author?.name}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedArticle.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedArticle(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
              </div>
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(selectedArticle._id)}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Heart className="w-5 h-5" />
                    <span>{selectedArticle.likes?.length || 0} likes</span>
                  </button>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-5 h-5" />
                    {selectedArticle.views} views
                  </span>
                </div>
                {(selectedArticle.author?._id === user?.id || user?.role === "admin") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedArticle._id)}
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

export default Knowledge;

