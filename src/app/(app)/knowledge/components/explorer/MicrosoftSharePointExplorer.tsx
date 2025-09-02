import React from "react";

interface MicrosoftSharePointExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const MicrosoftSharePointExplorer: React.FC<
  MicrosoftSharePointExplorerProps
> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">
        Microsoft SharePoint Explorer
      </div>
      <div style={{ color: "#888", fontSize: 13 }}>
        SharePoint explorer coming soon.
      </div>
    </div>
  );
};

export default MicrosoftSharePointExplorer;
