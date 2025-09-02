import React from "react";

interface ZendeskExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

const ZendeskExplorer: React.FC<ZendeskExplorerProps> = () => {
  return (
    <div className="bg-card rounded-lg shadow p-3">
      <div className="font-semibold mb-2 text-sm">Zendesk Explorer</div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Ticket explorer coming soon.
      </div>
    </div>
  );
};

export default ZendeskExplorer;
