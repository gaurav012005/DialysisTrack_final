import re

# Read the HTML file
with open('diagrams.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern to match diagram headers
pattern = r'(<div class="diagram-header">\s*<h3>)(.*?)(</h3>\s*<p>)(.*?)(</p>[^<]*</div>\s*<div class="diagram-content">\s*<div class="mermaid")'

count = 0

def add_download_button(match):
    global count
    # Check if button already exists
    if 'download-btn' in match.group(0):
        return match.group(0)
    
    title = match.group(2)
    desc = match.group(4)
    
    # Create ID from title
    diagram_id = 'diagram-' + re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    
    count += 1
    
    # Return the modified HTML with download button
    return (
        f'{match.group(1)}{title}{match.group(3)}{desc}</p>\n'
        f'                    <button class="download-btn" onclick="downloadDiagram(this, \'{diagram_id}\')">⬇️ Download SVG</button>\n'
        f'                </div>\n'
        f'                <div class="diagram-content">\n'
        f'                    <div class="mermaid" id="{diagram_id}"'
    )

# Replace all occurrences
result = re.sub(pattern, add_download_button, html, flags=re.DOTALL)

# Write back to file
with open('diagrams.html', 'w', encoding='utf-8') as f:
    f.write(result)

print(f'Successfully added {count} download buttons')
