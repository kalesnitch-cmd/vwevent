import os
import json
import urllib.request

path_port = r"c:\Users\kkale\OneDrive\Рабочий стол\verywell-decor"
token_file = r"C:\Users\kkale\.gemini\antigravity\brain\f4c6aa46-e29c-4fc4-b340-d9a442e38bc9\scratch\token.txt"

# Read token
with open(token_file, "r") as f:
    token = f.read().strip()

deployment_id = "dpl_Cz3j9etm7LmCKnoHoY6DYXAkBUKH"

def get_files_tree():
    url = f"https://api.vercel.com/v6/deployments/{deployment_id}/files"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0"
    })
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"Error fetching files list: {e}")
        return None

def download_file(file_uid, local_rel_path):
    url = f"https://api.vercel.com/v6/deployments/{deployment_id}/files/{file_uid}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0"
    })
    local_path = os.path.join(path_port, local_rel_path.replace("/", os.sep))
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read()
            with open(local_path, "wb") as f:
                f.write(content)
            print(f"Restored: {local_rel_path} ({len(content)/1024:.1f} KB)")
    except Exception as e:
        print(f"Error downloading {local_rel_path}: {e}")

def traverse_tree(node, current_path=""):
    files_to_download = []
    
    node_name = node.get("name", "")
    node_type = node.get("type", "")
    
    # Build path
    if current_path:
        new_path = f"{current_path}/{node_name}"
    else:
        new_path = node_name
        
    if node_type == "file":
        uid = node.get("uid")
        files_to_download.append((uid, new_path))
    elif node_type == "directory":
        children = node.get("children", [])
        for child in children:
            files_to_download.extend(traverse_tree(child, new_path))
            
    return files_to_download

if __name__ == "__main__":
    print("Fetching files list from Vercel deployment...")
    tree = get_files_tree()
    if not tree:
        print("Failed to get files list.")
        exit(1)
        
    # Vercel API v6 returns a list of root directory nodes
    all_files = []
    for root_node in tree:
        all_files.extend(traverse_tree(root_node))
        
    print(f"Found {len(all_files)} total files in deployment.")
    
    restored_count = 0
    for uid, path in all_files:
        # We only want to restore WebP files inside assets/images/
        if "assets/images/" in path and path.lower().endswith(".webp"):
            # Skip logo.webp and about_logo.webp as their optimized versions match Retinas perfectly
            if "logo.webp" in path or "about_logo.webp" in path:
                continue
                
            download_file(uid, path)
            restored_count += 1
            
    print(f"\nSuccessfully restored {restored_count} high-resolution image files.")
