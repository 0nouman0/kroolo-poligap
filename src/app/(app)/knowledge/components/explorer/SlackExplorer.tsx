import React from "react";

interface SlackExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const SlackExplorer: React.FC<SlackExplorerProps> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">Slack Explorer</div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Channel explorer coming soon.
      </div>
    </div>
  );
};

export default SlackExplorer;
