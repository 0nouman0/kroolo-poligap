import { useState, useEffect, useCallback } from 'react';

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

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (filters?: {
    category?: string;
    tags?: string[];
    search?: string;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters?.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/assets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const data = await response.json();
      setAssets(data.assets || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAsset = useCallback(async (file: File, metadata?: {
    category?: string;
    description?: string;
    tags?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata?.category) formData.append('category', metadata.category);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.tags) formData.append('tags', metadata.tags);
    
    const response = await fetch('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload asset');
    }
    
    const data = await response.json();
    
    // Add the new asset to the beginning of the list
    setAssets(prev => [data.asset, ...prev]);
    
    return data.asset;
  }, []);

  const deleteAssets = useCallback(async (assetIds: string[]) => {
    const response = await fetch('/api/assets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete assets');
    }
    
    // Remove deleted assets from the list
    setAssets(prev => prev.filter(asset => !assetIds.includes(asset._id)));
  }, []);

  const addTags = useCallback(async (assetIds: string[], tags: string[]) => {
    const response = await fetch('/api/assets/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds, tags }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add tags');
    }
    
    // Refresh assets to get updated tags
    await fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    deleteAssets,
    addTags,
  };
}
