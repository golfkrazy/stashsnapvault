# will display pending files and branch you are in
git status

# add either one file at a time OR bulk git add a.
git add -A
git commit -m "Fix optional params to be optional _ in \stashsnapvault\src\services\semanticSearch.ts for Netlify build"
git push


git add -A
git commit -m "Implementation of Trash, Recovery and Bulk Operations systems with Antigravity changes"
git push

# NEW branch and push creation
1. Navigate to project folder:
   C:\aom_NewXPS\ClaudeProjects\stashsnapvault>

2. Create and switch to new branch:
   git checkout -b stashsnapvault_trash_recov_bulk_ops

3. Stage all changes:
   git add -A

4. Commit changes with descriptive message:
   git commit -m "Implementation of Trash, Recovery and Bulk Operations systems with Antigravity changes"

5. Attempt to push (Git warns no upstream):
   git push

6. Set upstream and push branch to GitHub:
   git push --set-upstream origin stashsnapvault_trash_recov_bulk_ops

7. GitHub confirms new branch and provides PR link.