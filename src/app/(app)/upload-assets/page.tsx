"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive, 
  Search, 
  Filter, 
  Tag, 
  Download, 
  Trash2, 
  Eye,
  Plus,
  X,
  Grid3X3,
  List,
  Calendar,
  FileType,
  Hash,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  Presentation
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Asset {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
  tags: string[];
  category: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export default function UploadAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTags, setNewTags] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);

  // Fetch assets from backend
  const fetchAssets = useCallback(async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
        
        // Extract all unique tags
        const tags = new Set<string>();
        data.assets?.forEach((asset: Asset) => {
          asset.tags.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags));
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // File upload handler
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', getCategoryFromMimeType(file.type));

      // Initialize progress tracking
      const progressItem: UploadProgress = {
        filename: file.name,
        progress: 0,
        status: 'uploading'
      };
      
      setUploadProgress(prev => [...prev, progressItem]);

      try {
        const response = await fetch('/api/assets/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadProgress(prev => 
            prev.map(item => 
              item.filename === file.name 
                ? { ...item, progress: 100, status: 'completed' }
                : item
            )
          );
          return result.asset;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        setUploadProgress(prev => 
          prev.map(item => 
            item.filename === file.name 
              ? { ...item, status: 'error' }
              : item
          )
        );
        console.error('Upload error:', error);
        return null;
      }
    });

    const uploadedAssets = await Promise.all(uploadPromises);
    const successfulUploads = uploadedAssets.filter(asset => asset !== null);
    
    if (successfulUploads.length > 0) {
      setAssets(prev => [...successfulUploads, ...prev]);
    }

    setIsUploading(false);
    setTimeout(() => setUploadProgress([]), 3000);
  };

  // Get file category from mime type
  const getCategoryFromMimeType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'documents';
    return 'others';
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-5 w-5" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter assets based on search, category, and tags
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => asset.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Add tags to selected assets
  const handleAddTags = async () => {
    if (!newTags.trim() || selectedAssets.length === 0) return;

    const tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    try {
      const response = await fetch('/api/assets/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssets,
          tags: tags
        })
      });

      if (response.ok) {
        await fetchAssets();
        setSelectedAssets([]);
        setNewTags("");
        setIsTagDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding tags:', error);
    }
  };

  // Delete selected assets
  const handleDeleteAssets = async () => {
    if (selectedAssets.length === 0) return;

    try {
      const response = await fetch('/api/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: selectedAssets })
      });

      if (response.ok) {
        setAssets(prev => prev.filter(asset => !selectedAssets.includes(asset._id)));
        setSelectedAssets([]);
      }
    } catch (error) {
      console.error('Error deleting assets:', error);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Assets</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your files for cross-application usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uploadProgress.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.filename}</span>
                    <span className={
                      item.status === 'completed' ? 'text-green-600' :
                      item.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }>
                      {item.status === 'completed' ? 'Completed' :
                       item.status === 'error' ? 'Error' : `${item.progress}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.status === 'error' ? 100 : item.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Unified Upload Area */}
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Upload Your Files</h3>
            <p className="text-muted-foreground mb-6">
              Choose a file type below or drag and drop files anywhere
            </p>
          </div>

          {/* File Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { type: 'images', label: 'Photos', icon: FileImage, accept: 'image/*', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-300' },
              { type: 'audio', label: 'Music', icon: FileAudio, accept: 'audio/*', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300' },
              { type: 'documents', label: 'Documents', icon: FileText, accept: '.pdf,.doc,.docx,.txt,.rtf', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300' },
              { type: 'spreadsheets', label: 'Sheets', icon: FileSpreadsheet, accept: '.xlsx,.xls,.csv', color: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' },
              { type: 'presentations', label: 'Presentations', icon: Presentation, accept: '.pptx,.ppt', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300' }
            ].map((fileType) => {
              const IconComponent = fileType.icon;
              return (
                <div key={fileType.type} className="relative">
                  <input
                    id={`file-upload-${fileType.type}`}
                    type="file"
                    multiple
                    accept={fileType.accept}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFileType(fileType.type);
                        handleFileUpload(e.target.files);
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                  <div className={`relative p-6 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all duration-300 cursor-pointer group ${fileType.color}`}>
                    <div className="text-center">
                      <IconComponent className="h-12 w-12 mx-auto mb-3 transition-transform group-hover:scale-110" />
                      <h4 className="font-semibold text-sm">{fileType.label}</h4>
                      <p className="text-xs opacity-75 mt-1">Click to upload</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* General Upload Area */}
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('general-file-upload')?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">Or upload any file type</p>
            <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
            <input
              id="general-file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setSelectedFileType(null);
                  handleFileUpload(e.target.files);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>

        {selectedAssets.length > 0 && (
          <div className="flex gap-2">
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags ({selectedAssets.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tags to Selected Assets</DialogTitle>
                  <DialogDescription>
                    Add comma-separated tags to {selectedAssets.length} selected asset(s)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTags}>Add Tags</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="destructive" size="sm" onClick={handleDeleteAssets}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedAssets.length})
            </Button>
          </div>
        )}
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter by tags:</span>
          {allTags.slice(0, 10).map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(prev => prev.filter(t => t !== tag));
                } else {
                  setSelectedTags(prev => [...prev, tag]);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
          {allTags.length > 10 && (
            <Badge variant="outline">+{allTags.length - 10} more</Badge>
          )}
        </div>
      )}

      {/* Assets Grid/List */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assets found</h3>
            <p className="text-muted-foreground text-center">
              {assets.length === 0 
                ? "Upload your first asset to get started" 
                : "Try adjusting your search or filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {filteredAssets.map((asset) => (
            <Card 
              key={asset._id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAssets.includes(asset._id) ? 'ring-2 ring-primary' : ''
              } ${viewMode === 'list' ? 'p-3' : ''}`}
            >
              {viewMode === 'grid' ? (
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(asset.mimetype)}
                      <Checkbox
                        checked={selectedAssets.includes(asset._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssets(prev => [...prev, asset._id]);
                          } else {
                            setSelectedAssets(prev => prev.filter(id => id !== asset._id));
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {asset.mimetype.startsWith('image/') && asset.thumbnailUrl && (
                    <div className="w-full h-32 bg-muted rounded-md mb-3 overflow-hidden">
                      <img 
                        src={asset.thumbnailUrl} 
                        alt={asset.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm truncate" title={asset.originalName}>
                      {asset.originalName}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(asset.size)}</span>
                      <span>{new Date(asset.uploadDate).toLocaleDateString()}</span>
                    </div>
                    {asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {asset.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{asset.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              ) : (
                <div className="flex items-center gap-4 p-3">
                  <Checkbox
                    checked={selectedAssets.includes(asset._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAssets(prev => [...prev, asset._id]);
                      } else {
                        setSelectedAssets(prev => prev.filter(id => id !== asset._id));
                      }
                    }}
                  />
                  {getFileIcon(asset.mimetype)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{asset.originalName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(asset.size)}</span>
                      <span>{new Date(asset.uploadDate).toLocaleDateString()}</span>
                      <span className="capitalize">{asset.category}</span>
                    </div>
                  </div>
                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
