import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { fileSystem, FileNode } from "@/services/IDEFileSystem";
import { gitHubService } from "@/services/GitHubService";

interface ProjectFilesContextType {
  files: Record<string, FileNode>;
  selectedFile: string | null;
  selectFile: (path: string | null) => void;
  createNode: (path: string, type: "file" | "folder", content?: string, language?: string) => FileNode;
  updateNode: (path: string, content: string) => FileNode;
  deleteNode: (path: string, recursive?: boolean) => Record<string, FileNode> | void;
  renameNode: (oldPath: string, newName: string) => FileNode;
  undoDelete: () => void;
  listDirectory: (path: string) => FileNode[];
  exportProject: () => string;
  importProject: (json: string) => void;
  resetProject: () => void;
  getStats: () => { totalFiles: number; totalFolders: number; totalSize: number };
  getFileTree: () => FileNode[];
  importFiles: (filesMap: Record<string, string>) => void;
  cloneGitHubRepo: (url: string) => Promise<void>;
  getFileSummary: (path: string) => string;
}

const ProjectFilesContext = createContext<ProjectFilesContextType | undefined>(undefined);

export const ProjectFilesProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<Record<string, FileNode>>(fileSystem.getAllFiles());
  const [selectedFile, setSelectedFile] = useState<string | null>("/src/components/Auth.tsx");
  const [lastDeleted, setLastDeleted] = useState<Record<string, FileNode> | null>(null);

  const selectFile = useCallback((path: string | null) => {
    setSelectedFile(path);
  }, []);

  const createNode = useCallback((path: string, type: "file" | "folder", content = "", language = "text") => {
    const node = type === "file"
      ? fileSystem.createFile(path, content, language)
      : fileSystem.createFolder(path);
    setFiles(fileSystem.getAllFiles());
    return node;
  }, []);

  const updateNode = useCallback((path: string, content: string) => {
    const file = fileSystem.updateFile(path, content);
    setFiles(fileSystem.getAllFiles());
    return file;
  }, []);

  const deleteNode = useCallback((path: string, recursive = false) => {
    try {
      const deleted = fileSystem.delete(path, recursive);
      setFiles(fileSystem.getAllFiles());
      if (selectedFile === path || selectedFile?.startsWith(path + "/")) {
        setSelectedFile(null);
      }
      if (deleted) {
        setLastDeleted(deleted);
      }
      return deleted;
    } catch (err) {
      throw err;
    }
  }, [selectedFile]);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    fileSystem.restoreFiles(lastDeleted);
    setFiles(fileSystem.getAllFiles());
    setLastDeleted(null);
  }, [lastDeleted]);

  const renameNode = useCallback((oldPath: string, newName: string) => {
    const file = fileSystem.rename(oldPath, newName);
    setFiles(fileSystem.getAllFiles());
    if (selectedFile === oldPath) {
      setSelectedFile(file.path);
    }
    return file;
  }, [selectedFile]);

  const listDirectory = useCallback((path: string) => {
    return fileSystem.listDirectory(path);
  }, []);

  const exportProject = useCallback(() => {
    return fileSystem.exportToJSON();
  }, []);

  const importProject = useCallback((json: string) => {
    fileSystem.importFromJSON(json);
    setFiles(fileSystem.getAllFiles());
  }, []);

  const resetProject = useCallback(() => {
    fileSystem.reset();
    setFiles(fileSystem.getAllFiles());
    setSelectedFile("/src/components/Auth.tsx");
  }, []);

  const getStats = useCallback(() => {
    return fileSystem.getStats();
  }, []);

  const getFileTree = useCallback(() => {
    return fileSystem.getFileTree();
  }, []);

  const importFiles = useCallback((filesMap: Record<string, string>) => {
    for (const [path, content] of Object.entries(filesMap)) {
      try {
        if (!fileSystem.getFile(path)) {
          fileSystem.createFile(path, content);
        } else {
          fileSystem.updateFile(path, content);
        }
      } catch (err) {
        console.warn(`Failed to import file ${path}`, err);
      }
    }
    setFiles(fileSystem.getAllFiles());
  }, []);

  const cloneGitHubRepo = useCallback(async (url: string) => {
    const parsed = gitHubService.parseGitHubUrl(url);
    if (!parsed) {
      throw new Error("Invalid GitHub URL");
    }

    const { owner, repo } = parsed;
    const targetPath = `/repos/${repo}`;

    // Check if repo already exists
    if (fileSystem.getAllFiles()[`${targetPath}/README.md`]) {
      throw new Error("Repository already cloned");
    }

    const clonedFiles = await gitHubService.cloneRepo(owner, repo, targetPath);
    fileSystem.importFromJSON(JSON.stringify(clonedFiles));
    setFiles(fileSystem.getAllFiles());
  }, []);

  const getFileSummary = useCallback((path: string) => {
    const file = fileSystem.getFile(path);
    if (!file) return "File not found.";
    if (file.type === "folder") return `Directory with ${file.children?.length || 0} items.`;
    const lines = file.content?.split("\n").length || 0;
    return `${file.name} (${file.language || "text"}) - ${lines} lines, ${file.content?.length || 0} bytes.`;
  }, []);

  const contextValue: ProjectFilesContextType = {
    files,
    selectedFile,
    selectFile,
    createNode,
    updateNode,
    deleteNode,
    renameNode,
    undoDelete,
    listDirectory,
    exportProject,
    importProject,
    resetProject,
    getStats,
    getFileTree,
    importFiles,
    cloneGitHubRepo,
    getFileSummary,
  };

  return (
    <ProjectFilesContext.Provider value={contextValue}>
      {children}
    </ProjectFilesContext.Provider>
  );
};

export const useProjectFiles = () => {
  const context = useContext(ProjectFilesContext);
  if (!context) {
    throw new Error("useProjectFiles must be used within ProjectFilesProvider");
  }
  return context;
};
