import React from "react";

interface MicrosoftTeamsExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const MicrosoftTeamsExplorer: React.FC<MicrosoftTeamsExplorerProps> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">Microsoft Teams Explorer</div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Teams explorer coming soon.
      </div>
    </div>
  );
};

export default MicrosoftTeamsExplorer;
