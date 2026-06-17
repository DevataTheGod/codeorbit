/**
 * GitHub Service
 * Handles GitHub API operations for repository cloning and file fetching
 */

import { Octokit } from "@octokit/rest";

export interface GitHubRepo {
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  description?: string;
}

export interface GitHubFile {
  path: string;
  type: "file" | "dir";
  size?: number;
  content?: string;
  encoding?: string;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  }

  /**
   * Get repository information
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return {
      owner: data.owner.login,
      name: data.name,
      full_name: data.full_name,
      default_branch: data.default_branch,
      description: data.description || undefined,
    };
  }

  /**
   * Get repository tree recursively
   */
  async getRepoTree(owner: string, repo: string, branch = "main"): Promise<GitHubFile[]> {
    try {
      // First try the default branch
      const { data: ref } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });

      const { data: tree } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: ref.object.sha,
        recursive: "true",
      });

      return tree.tree
        .filter(item => item.type === "blob" && !this.isBinaryFile(item.path))
        .map(item => ({
          path: item.path,
          type: item.type === "tree" ? "dir" : "file",
          size: item.size,
        }));
    } catch (error) {
      // If branch doesn't exist, try 'master'
      if (branch === "main") {
        return this.getRepoTree(owner, repo, "master");
      }
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileContent(owner: string, repo: string, path: string, branch = "main"): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(data)) {
      throw new Error(`${path} is a directory`);
    }

    if (data.type !== "file") {
      throw new Error(`${path} is not a file`);
    }

    if (data.encoding === "base64" && data.content) {
      return atob(data.content.replace(/\n/g, ""));
    }

    return data.content || "";
  }

  /**
   * Clone repository to file system
   */
  async cloneRepo(owner: string, repo: string, targetPath: string): Promise<Record<string, any>> {
    const files: Record<string, any> = {};
    const tree = await this.getRepoTree(owner, repo);

    // Limit to reasonable size
    if (tree.length > 1000) {
      throw new Error("Repository too large (>1000 files). Cloning not supported.");
    }

    for (const item of tree) {
      if (item.type === "file") {
        try {
          const content = await this.getFileContent(owner, repo, item.path);
          const filePath = `${targetPath}/${item.path}`;
          files[filePath] = {
            id: `github-${owner}-${repo}-${item.path.replace(/\//g, "-")}`,
            path: filePath,
            name: item.path.split("/").pop() || item.path,
            type: "file",
            content,
            language: this.getLanguageFromPath(item.path),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        } catch (error) {
          console.warn(`Failed to fetch ${item.path}:`, error);
          // Skip binary or problematic files
        }
      }
    }

    return files;
  }

  /**
   * Check if file is likely binary
   */
  private isBinaryFile(path: string): boolean {
    const binaryExtensions = [
      ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg",
      ".mp4", ".avi", ".mov", ".wmv", ".flv",
      ".mp3", ".wav", ".flac", ".aac",
      ".zip", ".rar", ".7z", ".tar", ".gz",
      ".pdf", ".doc", ".docx", ".xls", ".xlsx",
      ".exe", ".dll", ".so", ".dylib",
    ];

    const ext = path.toLowerCase().substring(path.lastIndexOf("."));
    return binaryExtensions.includes(ext);
  }

  /**
   * Get language from file path
   */
  private getLanguageFromPath(path: string): string {
    const ext = path.toLowerCase().substring(path.lastIndexOf("."));
    const langMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".cs": "csharp",
      ".php": "php",
      ".rb": "ruby",
      ".go": "go",
      ".rs": "rust",
      ".html": "html",
      ".css": "css",
      ".scss": "scss",
      ".less": "less",
      ".json": "json",
      ".xml": "xml",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".md": "markdown",
      ".sql": "sql",
      ".sh": "shell",
      ".bash": "shell",
    };
    return langMap[ext] || "text";
  }
}

export const gitHubService = new GitHubService();
