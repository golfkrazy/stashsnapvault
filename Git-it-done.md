# Git-it-done: A StashSnap Vault Git Guide 🚀

This guide provides step-by-step instructions for the most common Git workflows used in our project.

---

## 1. Checking Your Status & History
Before doing anything, you should always check where you are.

- **Check Current Status:** Shows which files are modified, staged, or untracked.
  ```powershell
  git status
  ```
- **View History:** Shows a list of previous commits.
  ```powershell
  git log --oneline --graph --decorate -n 10
  ```
  *(The extra flags make it pretty and readable!)*

---

## 2. Branching: Work in Isolation
Never work on `main` directly for big features. Always create a branch.

- **List All Local Branches:**
  ```powershell
  git branch
  ```
- **List All Branches (Local + Remote/GitHub):**
  ```powershell
  git branch -a
  ```
- **Create and Switch to a New Branch:**
  ```powershell
  git checkout -b feature-name
  ```
- **Switch Back to an Existing Branch:**
  ```powershell
  git checkout main
  ```

- **View on GitHub Website:**
  1. Open the [repo](https://github.com/golfkrazy/stashsnapvault).
  2. Click the branch dropdown (usually says `main`).
  3. Or click the **"Branches"** link directly above the file list for a full list.

---

## 3. Staging: Preparing for Commit
"Staging" is like putting files in a box before you tape it shut (committing).

- **Stage a Specific File:**
  ```powershell
  git add path/to/file.tsx
  ```
- **Stage Multiple Files:** Just list them separated by spaces.
  ```powershell
  git add file1.tsx file2.tsx file3.sql
  ```
- **Stage a Whole Folder:**
  ```powershell
  git add src/components/
  ```
- **Stage Everything:** (Standard practice)
  ```powershell
  git add .
  ```

---

## 4. Committing: Saving Your Work
A commit is a snapshot of your staged files.

- **Option A: Quick Single-Line Message:**
  ```powershell
  git commit -m "Your short message here"
  ```

- **Option B: Multi-Line Message (The Professional Way):**
  If you want to include a detailed description:
  1. Just type:
     ```powershell
     git commit
     ```
  2. Git will open your default editor (likely Notepad, VS Code, or Vim).
  3. **In the editor:**
     - The first line is the **Subject**.
     - Leave the second line **Blank**.
     - Use the third line and onwards for the **Detailed Description**.
  4. **Save and Close** the file. Git will automatically complete the commit using that text.

---

## 5. Pushing: Uploading to GitHub
Once you've committed locally, you need to "push" it to the server.

- **Standard Push:**
  ```powershell
  git push
  ```
- **First Push for a New Branch:**
  If you just created the branch, you need to link it to the server:
  ```powershell
  git push --set-upstream origin feature-name
  ```

---

## 6. Merging: Bringing it all Together
When your feature is done and pushed, you want to bring those changes back into the `main` branch.

1. **Switch to Main:**
   ```powershell
   git checkout main
   ```
2. **Update Main:** (Make sure you have the latest code from GitHub)
   ```powershell
   git pull origin main
   ```
3. **Merge the Feature:**
   ```powershell
   git merge feature-name
   ```
4. **Push the Merged Main:**
   ```powershell
   git push origin main
   ```

---

## 7. Configuring Your Editor
When you run `git commit` without the `-m`, Git opens an editor. By default, your system is set to use **Visual Studio Code**.

- **How it works with VS Code:** A new tab named `COMMIT_EDITMSG` will open. Type your message, save it (`Ctrl+S`), and close the tab to finish the commit.

- **To change to Notepad (separates it from your code):**
  ```powershell
  git config --global core.editor "notepad"
  ```

---

## 💡 Pro Tip: The "Oops" Command
If you accidentally stage a file you didn't mean to:
```powershell
git restore --staged filename.js
```

**Happy Versioning!**
