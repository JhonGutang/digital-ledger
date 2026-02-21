---
description: How to automatically add, commit, and push changes with categorized commit messages
---

## Git Push Workflow

When the user asks to push their changes (e.g., `/git-push`), follow these steps:

// turbo-all

### 1. Check the current git status

```bash
git status
```

Review the output to understand what files have been changed, added, or deleted.

### 2. Determine the commit category

Based on the nature of the changes, select **one** of the following categories:

| Category | Prefix | Format |
|---|---|---|
| **Feature** | `Implemented Feature:` | A new feature, endpoint, component, or capability was added. |
| **Debug** | `Successfully Debugged:` | A bug was identified and fixed. Include the problem and the solution. |
| **Documentation** | `Improved Context:` | Documentation, comments, or context files were added or updated. |

### 3. Generate the commit message

Write a commit message that follows these rules:
- Start with the correct prefix from the table above.
- The message after the prefix must be **3 sentences or fewer**.
- Be specific and concise about what was done.

**Examples:**

- `Implemented Feature: Added JWT-based authentication to the AuthController. Users can now register and login with email and password. Tokens are issued with a 24-hour expiry.`
- `Successfully Debugged: Fixed double peso symbol appearing in dashboard insights. The issue was caused by a redundant currency formatter in the utility function. Removed the duplicate call in the rendering pipeline.`
- `Improved Context: Added error handling guidelines documentation. Covers middleware exception patterns and standardized API error responses.`

### 4. Stage all changes

```bash
git add .
```

### 5. Commit with the generated message

```bash
git commit -m "<generated commit message>"
```

Replace `<generated commit message>` with the message from Step 3.

### 6. Push to the current branch

```bash
git push
```

If the branch has no upstream tracking branch, use:
```bash
git push --set-upstream origin <branch-name>
```

### 7. Confirm success

Run `git log -1 --oneline` to verify the commit was pushed, and report the result to the user.

## Rules
- Always check `git status` before committing to understand all changes.
- Never mix categories in a single commit. If changes span multiple categories, create **separate commits** for each.
- The commit message must be concise — **3 sentences max** after the prefix.
- Always push after committing. Do not leave commits local-only.
