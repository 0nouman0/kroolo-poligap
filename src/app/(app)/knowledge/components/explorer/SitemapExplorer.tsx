import React from "react";
import { Network, Globe, Link } from "lucide-react";

interface SitemapExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const SitemapExplorer: React.FC<SitemapExplorerProps> = ({
  files,
  selectedFolder,
  onFolderSelect,
}) => {
  // Group files by type for sitemap display
  const sitemapFiles = files.filter(file => file.type === 'sitemap');
  const crawledPages = files.filter(file => file.type === 'webpage');

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <div className="font-semibold mb-4 text-sm flex items-center gap-2">
        <Network className="w-4 h-4" />
        Sitemap Explorer
      </div>
      
      <div className="space-y-4">
        {/* Sitemap Files Section */}
        {sitemapFiles.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Sitemaps ({sitemapFiles.length})
            </div>
            <div className="space-y-1">
              {sitemapFiles.map((file) => (
                <div
                  key={file.id}
                  className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                    selectedFolder === file.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => onFolderSelect(file.id)}
                >
                  <div className="flex items-center gap-2">
                    <Network className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{file.name || file.url}</span>
                  </div>
                  {file.status && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Status: {file.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crawled Pages Section */}
        {crawledPages.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Link className="w-3 h-3" />
              Crawled Pages ({crawledPages.length})
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {crawledPages.map((file) => (
                <div
                  key={file.id}
                  className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                    selectedFolder === file.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => onFolderSelect(file.id)}
                >
                  <div className="flex items-center gap-2">
                    <Link className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{file.name || file.url}</span>
                  </div>
                  {file.status && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Status: {file.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-8">
            <Network className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">
              No sitemap data available
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Connect your sitemap to start crawling web pages
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitemapExplorer;
