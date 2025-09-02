import React from "react";

interface ConfluenceExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const ConfluenceExplorer: React.FC<ConfluenceExplorerProps> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">Confluence Explorer</div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Space explorer coming soon.
      </div>
    </div>
  );
};

export default ConfluenceExplorer;
