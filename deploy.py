#!/usr/bin/env python3
"""
Deploy AgentOS to GitHub using GitHub API
Then Vercel will auto-deploy from GitHub
"""

import os
import json
import base64
import requests
from pathlib import Path

# Configuration
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO_OWNER = "CR-AudioViz-AI"
REPO_NAME = "agentos-production"
BRANCH = "main"

if not GITHUB_TOKEN:
    print("❌ Error: GITHUB_TOKEN environment variable not set")
    exit(1)

# GitHub API base URL
API_BASE = "https://api.github.com"

headers = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

def get_all_files(directory):
    """Get all files in directory recursively"""
    files = []
    for root, dirs, filenames in os.walk(directory):
        # Skip node_modules, .next, .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
        
        for filename in filenames:
            filepath = os.path.join(root, filename)
            # Get relative path from directory
            relpath = os.path.relpath(filepath, directory)
            files.append(relpath)
    
    return files

def read_file_content(filepath):
    """Read file and return base64 encoded content"""
    with open(filepath, 'rb') as f:
        content = f.read()
        return base64.b64encode(content).decode('utf-8')

def get_latest_commit_sha():
    """Get the SHA of the latest commit on main branch"""
    url = f"{API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/git/ref/heads/{BRANCH}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()['object']['sha']
    elif response.status_code == 404:
        # Branch doesn't exist, return None
        return None
    else:
        print(f"❌ Error getting latest commit: {response.status_code}")
        print(response.text)
        return None

def create_tree(base_tree_sha, files_data):
    """Create a new tree with all files"""
    url = f"{API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/git/trees"
    
    tree_items = []
    for file_path, content in files_data.items():
        tree_items.append({
            "path": file_path,
            "mode": "100644",  # Regular file
            "type": "blob",
            "content": content
        })
    
    data = {
        "tree": tree_items
    }
    
    if base_tree_sha:
        data["base_tree"] = base_tree_sha
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()['sha']
    else:
        print(f"❌ Error creating tree: {response.status_code}")
        print(response.text)
        return None

def get_base_tree_sha(commit_sha):
    """Get the tree SHA from a commit"""
    url = f"{API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/git/commits/{commit_sha}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()['tree']['sha']
    else:
        return None

def create_commit(tree_sha, parent_sha, message):
    """Create a new commit"""
    url = f"{API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/git/commits"
    
    data = {
        "message": message,
        "tree": tree_sha,
    }
    
    if parent_sha:
        data["parents"] = [parent_sha]
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()['sha']
    else:
        print(f"❌ Error creating commit: {response.status_code}")
        print(response.text)
        return None

def update_branch_reference(commit_sha, force=False):
    """Update the branch reference to point to the new commit"""
    url = f"{API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{BRANCH}"
    
    data = {
        "sha": commit_sha,
        "force": force
    }
    
    # Try to update existing ref
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return True
    elif response.status_code == 404:
        # Ref doesn't exist, create it
        url = f"{API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/git/refs"
        data = {
            "ref": f"refs/heads/{BRANCH}",
            "sha": commit_sha
        }
        response = requests.post(url, headers=headers, json=data)
        return response.status_code == 201
    else:
        print(f"❌ Error updating reference: {response.status_code}")
        print(response.text)
        return False

def main():
    print("=" * 70)
    print("🚀 DEPLOYING AGENTOS TO GITHUB VIA API")
    print("=" * 70)
    print()
    
    project_dir = "/home/claude/agentos"
    os.chdir(project_dir)
    
    # Step 1: Get all files
    print("📦 Step 1: Collecting files...")
    all_files = get_all_files(".")
    print(f"   Found {len(all_files)} files")
    print()
    
    # Step 2: Read file contents (in batches to avoid memory issues)
    print("📖 Step 2: Reading file contents...")
    files_data = {}
    
    # GitHub API has limits, so we'll do this in one shot for small projects
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                files_data[file_path] = content
                print(f"   ✓ {file_path}")
        except Exception as e:
            print(f"   ⚠️  Skipping {file_path}: {e}")
    
    print()
    
    # Step 3: Get latest commit
    print("🔍 Step 3: Getting latest commit...")
    latest_commit_sha = get_latest_commit_sha()
    
    if latest_commit_sha:
        print(f"   Latest commit: {latest_commit_sha[:8]}")
        base_tree_sha = get_base_tree_sha(latest_commit_sha)
    else:
        print("   No existing commits (new repository)")
        latest_commit_sha = None
        base_tree_sha = None
    print()
    
    # Step 4: Create tree
    print("🌳 Step 4: Creating tree with all files...")
    tree_sha = create_tree(base_tree_sha, files_data)
    
    if not tree_sha:
        print("❌ Failed to create tree")
        return False
    
    print(f"   Tree created: {tree_sha[:8]}")
    print()
    
    # Step 5: Create commit
    print("💾 Step 5: Creating commit...")
    commit_message = "Deploy complete AgentOS site - Tony & Laura Harvey"
    commit_sha = create_commit(tree_sha, latest_commit_sha, commit_message)
    
    if not commit_sha:
        print("❌ Failed to create commit")
        return False
    
    print(f"   Commit created: {commit_sha[:8]}")
    print()
    
    # Step 6: Update branch
    print(f"🔄 Step 6: Updating {BRANCH} branch...")
    success = update_branch_reference(commit_sha, force=True)
    
    if not success:
        print("❌ Failed to update branch")
        return False
    
    print(f"   ✅ Branch {BRANCH} updated!")
    print()
    
    print("=" * 70)
    print("✅ DEPLOYMENT TO GITHUB COMPLETE!")
    print("=" * 70)
    print()
    print(f"📍 Repository: https://github.com/{REPO_OWNER}/{REPO_NAME}")
    print(f"🔄 Vercel will auto-deploy in ~2-3 minutes")
    print(f"🌐 Live URL: https://agentos-production.vercel.app")
    print()
    
    return True

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
