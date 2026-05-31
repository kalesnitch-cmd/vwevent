import os
import re

path_port = r"c:\Users\kkale\OneDrive\Рабочий стол\verywell-decor"

def minify_css(css_content):
    # Remove multi-line comments
    css = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    # Remove whitespaces around separators
    css = re.sub(r'\s*([:;{},])\s*', r'\1', css)
    # Remove multiple spaces and newlines
    css = re.sub(r'\s+', ' ', css)
    return css.strip()

def minify_js(js_content):
    # Remove single line comments
    js = re.sub(r'/\*.*?\*/', '', js_content, flags=re.DOTALL)
    
    # Strip comments line by line
    lines = js.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith('//'):
            continue
        cleaned_lines.append(stripped)
        
    js = '\n'.join(cleaned_lines)
    js = re.sub(r'\n+', '\n', js)
    return js.strip()

def run_minification():
    css_src = os.path.join(path_port, "assets", "css", "style.css")
    css_dest = os.path.join(path_port, "assets", "css", "style.min.css")
    
    js_src = os.path.join(path_port, "assets", "js", "main.js")
    js_dest = os.path.join(path_port, "assets", "js", "main.min.js")
    
    if os.path.exists(css_src):
        with open(css_src, "r", encoding="utf-8") as f:
            content = f.read()
        minified = minify_css(content)
        with open(css_dest, "w", encoding="utf-8") as f:
            f.write(minified)
        print(f"Minified CSS: {css_src} -> {css_dest} | {len(content)/1024:.1f}KB -> {len(minified)/1024:.1f}KB")
        
    if os.path.exists(js_src):
        with open(js_src, "r", encoding="utf-8") as f:
            content = f.read()
        minified = minify_js(content)
        with open(js_dest, "w", encoding="utf-8") as f:
            f.write(minified)
        print(f"Minified JS: {js_src} -> {js_dest} | {len(content)/1024:.1f}KB -> {len(minified)/1024:.1f}KB")

if __name__ == "__main__":
    run_minification()
