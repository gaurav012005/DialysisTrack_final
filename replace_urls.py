import os

def replace_in_file(filepath, search_str, replace_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if search_str in content:
        content = content.replace(search_str, replace_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def process_directory(directory, search_str, replace_str):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                filepath = os.path.join(root, file)
                replace_in_file(filepath, search_str, replace_str)

if __name__ == "__main__":
    src_dir = r"c:\6 sem\DialysisTrack-mainvvlatest\DialysisTrack-mainvv3\frontend\src"
    process_directory(src_dir, "192.168.0.107", "localhost")
    print("Done reverting network URLs back to localhost.")
