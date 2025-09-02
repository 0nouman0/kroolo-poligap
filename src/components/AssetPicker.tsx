"use client";

import React, { useState, useEffect } from "react";
import { 
  File, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive, 
  Search, 
  Check,
  X,
  Upload,
  Grid3X3,
  List
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface AssetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: Asset[]) => void;
  multiple?: boolean;
  allowedTypes?: string[]; // e.g., ['image/*', 'application/pdf']
  title?: string;
  description?: string;
}

export function AssetPicker({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  title = "Select Assets",
  description = "Choose from your uploaded assets"
}: AssetPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(false);

  // Fetch assets when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  // Filter assets based on search, category, and allowed types
  useEffect(() => {
    let filtered = assets;

    // Filter by allowed types
    if (allowedTypes && allowedTypes.length > 0) {
      filtered = filtered.filter(asset => {
        return allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            const baseType = type.replace('/*', '');
            return asset.mimetype.startsWith(baseType);
          }
          return asset.mimetype === type;
        });
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory, allowedTypes]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assets?ts=${Date.now()}` , { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAssetSelect = (asset: Asset) => {
    if (multiple) {
      setSelectedAssets(prev => {
        const isSelected = prev.find(a => a._id === asset._id);
        if (isSelected) {
          return prev.filter(a => a._id !== asset._id);
        } else {
          return [...prev, asset];
        }
      });
    } else {
      setSelectedAssets([asset]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedAssets);
    setSelectedAssets([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedAssets([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assets found</h3>
              <p className="text-muted-foreground">
                {assets.length === 0 
                  ? "Upload some assets first to use them here" 
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
              : "space-y-2 p-4"
            }>
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssets.find(a => a._id === asset._id);
                
                return (
                  <Card 
                    key={asset._id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${viewMode === 'list' ? 'p-3' : ''}`}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    {viewMode === 'grid' ? (
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(asset.mimetype)}
                            {multiple && (
                              <Checkbox
                                checked={!!isSelected}
                                onChange={() => {}} // Handled by card click
                              />
                            )}
                          </div>
                          {isSelected && (
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        
                        {asset.mimetype.startsWith('image/') && asset.thumbnailUrl && (
                          <div className="w-full h-20 bg-muted rounded-md mb-2 overflow-hidden">
                            <img 
                              src={asset.thumbnailUrl} 
                              alt={asset.originalName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm truncate" title={asset.originalName}>
                              {asset.originalName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                            <span className="shrink-0">{formatFileSize(asset.size)}</span>
                            <span className="shrink-0">•</span>
                            <span className="shrink-0">{new Date(asset.uploadDate).toLocaleDateString()}</span>
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
                      <div className="flex items-start gap-4 p-3">
                        {multiple && (
                          <Checkbox
                            checked={!!isSelected}
                            onChange={() => {}} // Handled by card click
                          />
                        )}
                        {getFileIcon(asset.mimetype)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium whitespace-normal break-words">{asset.originalName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                        {isSelected && (
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedAssets.length > 0 && (
              <span>{selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={selectedAssets.length === 0}
            >
              Select {selectedAssets.length > 0 && `(${selectedAssets.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
