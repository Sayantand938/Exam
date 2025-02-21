# script/dir_tree.py
import os

def print_tree(directory, prefix="", exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = set()
    
    # List all entries in the directory
    entries = os.listdir(directory)
    entries.sort()  # Sort entries for consistent output
    
    for i, entry in enumerate(entries):
        full_path = os.path.join(directory, entry)
        
        # Skip excluded directories
        if os.path.isdir(full_path) and entry in exclude_dirs:
            continue
        
        # Determine if this is the last entry in the directory
        is_last = i == len(entries) - 1
        
        # Print the current entry
        print(prefix + ("└── " if is_last else "├── ") + entry)
        
        # If the entry is a directory, recursively print its contents
        if os.path.isdir(full_path):
            extension = "    " if is_last else "│   "
            print_tree(full_path, prefix + extension, exclude_dirs)

if __name__ == "__main__":
    # Get the absolute path to the project root (assuming this script is in the project root)
    current_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Print the project root directory
    print(f"Project Root Directory: {current_directory}")
    
    # Directories to exclude (added '__pycache__' and 'backup')
    exclude_dirs = {"node_modules", "venv", ".git", "__pycache__", "backup"}
    
    # Print the tree structure
    print_tree(current_directory, exclude_dirs=exclude_dirs)