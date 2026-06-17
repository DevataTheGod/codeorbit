# TODO: Improve IDE UI to be more like VS Code

## Current State
The IDE already has:
- Monaco Editor (VS Code's editor) ✓
- File Explorer with tree view ✓
- File Operations Panel ✓
- Terminal ✓
- AI Chat Panel ✓
- Floating AI Chat in student dashboard ✓

## Improvements Needed

### 1. Activity Bar (Far Left)
Add a vertical bar on the far left with icons:
- Explorer (files)
- Search
- Source Control (Git)
- Extensions
- Settings

### 2. Tabs for Open Files
Add tabs above the code editor to show open files, similar to VS Code

### 3. Breadcrumbs
Add breadcrumbs above the editor showing the file path

### 4. Status Bar
Add a status bar at the bottom showing:
- Current branch (if any)
- Line/column number
- Language mode
- Encoding

### 5. File Upload from Local Storage
Add ability to upload files from local computer (in addition to JSON import)

## Implementation Plan
1. Update IDEWorkspace.tsx to add activity bar
2. Add tabs component for open files
3. Add breadcrumbs component
4. Add status bar component
5. Add file upload feature to FileOperationsPanel
6. Test all features

## Files to Modify
- src/components/ide/IDEWorkspace.tsx - Main IDE layout
- src/components/ide/CodeEditor.tsx - Add breadcrumbs
- src/components/ide/FileOperationsPanel.tsx - Add file upload
- src/components/ide/ActivityBar.tsx - New component
- src/components/ide/FileTabs.tsx - New component
- src/components/ide/StatusBar.tsx - New component
