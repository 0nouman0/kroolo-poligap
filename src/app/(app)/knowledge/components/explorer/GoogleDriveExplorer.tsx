import React from "react";

interface GoogleDriveExplorerProps {
  files: any[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

// Helper to build a folder tree from files' folder_structure
function buildFolderTree(files: any[]) {
  const root: any = {};

  files.forEach((file) => {
    const folderNames = file.folder_structure?.folder_names || ["Root"];
    let node = root;
    folderNames.forEach((name: string, idx: number) => {
      if (!node[name])
        node[name] = { __files: [], __children: {}, __totalFiles: 0 };
      if (idx === folderNames.length - 1) {
        node[name].__files.push(file);
      }
      node = node[name].__children;
    });
  });

  // Calculate total files for each folder (including nested folders)
  function calculateTotalFiles(node: any): number {
    let total = 0;

    // Add direct files in this folder
    total += node.__files?.length || 0;

    // Add files from all child folders
    Object.values(node.__children || {}).forEach((child: any) => {
      total += calculateTotalFiles(child);
    });

    node.__totalFiles = total;
    return total;
  }

  // Calculate totals starting from root
  Object.values(root).forEach((node: any) => {
    calculateTotalFiles(node);
  });

  return root;
}

function renderTree(
  node: any,
  path: string[],
  selectedFolder: string | null,
  onFolderSelect: (folder: string | null) => void
) {
  return Object.entries(node).map(([folder, data]: any) => {
    const fullPath = [...path, folder].join("/");
    const isSelected = selectedFolder === fullPath;
    const totalFiles = data.__totalFiles || 0;

    const handleFolderClick = () => {
      if (isSelected) {
        // If folder is already selected, select its parent instead
        const parentPath = path.length > 0 ? path.join("/") : null;
        onFolderSelect(parentPath);
      } else {
        // If folder is not selected, select it
        onFolderSelect(fullPath);
      }
    };

    return (
      <div key={fullPath} style={{ marginLeft: path.length * 12 }}>
        <div
          onClick={handleFolderClick}
          style={{
            cursor: "pointer",
            fontWeight: isSelected ? "bold" : "normal",
            color: isSelected ? "#2563eb" : undefined,
            background: isSelected ? "#e0e7ff" : undefined,
            borderRadius: 4,
            padding: "2px 6px",
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span role="img" aria-label="folder">
            📁
          </span>
          <span>{folder}</span>
          {totalFiles > 0 && (
            <span
              style={{
                fontSize: 10,
                color: "#6b7280",
                background: "#f3f4f6",
                padding: "1px 6px",
                borderRadius: 10,
                fontWeight: "normal",
                marginLeft: 4,
              }}
            >
              {totalFiles}
            </span>
          )}
        </div>
        {isSelected || selectedFolder?.startsWith(fullPath) ? (
          <div>
            {renderTree(
              data.__children,
              [...path, folder],
              selectedFolder,
              onFolderSelect
            )}
          </div>
        ) : null}
      </div>
    );
  });
}

const GoogleDriveExplorer: React.FC<GoogleDriveExplorerProps> = ({
  files,
  selectedFolder,
  onFolderSelect,
}) => {
  const folderTree = buildFolderTree(files);
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <div className="font-semibold mb-2 text-sm">Google Drive Explorer</div>
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {renderTree(folderTree, [], selectedFolder, onFolderSelect)}
      </div>
    </div>
  );
};

export default GoogleDriveExplorer;
