import React from "react";

interface DropboxExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const DropboxExplorer: React.FC<DropboxExplorerProps> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">Dropbox Explorer</div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Folder explorer coming soon.
      </div>
    </div>
  );
};

export default DropboxExplorer;
