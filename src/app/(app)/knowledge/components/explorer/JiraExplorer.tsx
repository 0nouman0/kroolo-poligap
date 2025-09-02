import React from "react";

interface JiraExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const JiraExplorer: React.FC<JiraExplorerProps> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">Jira Explorer</div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Project explorer coming soon.
      </div>
    </div>
  );
};

export default JiraExplorer;
