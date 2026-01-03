#!/usr/bin/env python3
"""
DSA Web Scraper using Beautiful Soup + Serper.dev
With intelligent content cleaning and structuring for LLM consumption
Serper.dev used for search to ensure reliable results
"""

import sys
import json
import requests
from bs4 import BeautifulSoup, NavigableString
from urllib.parse import quote_plus
import re
import time

# Serper.dev Configuration
SERPER_API_KEY = "e9b13a7e70500411e69f499233c17e1c3c378b75"

# Configure requests session
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
})


def clean_text(text: str) -> str:
    """
    Clean and normalize text for LLM consumption
    Removes noise, extra whitespace, and formats properly
    """
    if not text:
        return ""
    
    # Remove multiple newlines (keep max 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove multiple spaces
    text = re.sub(r' {2,}', ' ', text)
    
    # Remove tab characters and replace with space
    text = text.replace('\t', ' ')
    
    # Remove weird unicode characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    
    # Clean up common noise patterns
    text = re.sub(r'\s*\n\s*', '\n', text)  # Remove spaces around newlines
    
    # Remove advertisement-related text
    noise_patterns = [
        r'Advertisement\s*',
        r'Improve\s+Article\s*',
        r'Save\s+Article\s*',
        r'Like\s+Article\s*',
        r'Share\s+your\s+thoughts.*',
        r'Report\s*Issue\s*',
        r'Suggest\s+Changes\s*',
        r'\d+\s*Likes?\s*',
        r'Read\s+More\s*',
        r'See\s+More\s*',
        r'Last\s+Updated\s*:\s*[\d\w\s,]+',
        r'Comments?\s*Improve\s*',
    ]
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    return text.strip()


def extract_structured_content(soup: BeautifulSoup, url: str) -> dict:
    """
    Extract and structure content from GeeksforGeeks page
    Returns structured data with title, problem, approach, complexity, code
    """
    result = {
        'title': '',
        'problem_statement': '',
        'approach': '',
        'complexity': '',
        'code_examples': [],
        'key_points': []
    }
    
    # Remove unwanted elements first
    for element in soup.select('script, style, nav, header, footer, .header-main, .side-bar, .article-meta, .comments, .related-articles, .advertisement, .gfg-icon, .login-modal, .tooltip'):
        element.decompose()
    
    # Get title
    title_elem = soup.select_one('h1, .article-title, .entry-title')
    if title_elem:
        result['title'] = clean_text(title_elem.get_text())
    
    # Get main article content
    article = soup.select_one('article.content, .article-content, .text, article, main')
    if not article:
        article = soup.find('body')
    
    if article:
        # Extract problem statement (usually first paragraph or "Problem Statement" section)
        problem_section = article.find(['p', 'div'], string=re.compile(r'(given|find|determine|check|count)', re.I))
        if problem_section:
            result['problem_statement'] = clean_text(problem_section.get_text())
        else:
            # Try first few paragraphs
            paragraphs = article.find_all('p', limit=3)
            problem_text = ' '.join([p.get_text() for p in paragraphs])
            result['problem_statement'] = clean_text(problem_text)[:500]
        
        # Extract approaches (look for headers with "Approach" or "Method" or "Solution")
        approach_headers = article.find_all(['h2', 'h3', 'strong', 'b'], 
            string=re.compile(r'(approach|method|solution|algorithm|idea|intuition)', re.I))
        
        approaches = []
        for header in approach_headers[:3]:  # Max 3 approaches
            approach_text = header.get_text()
            # Get following content until next header
            next_content = []
            for sibling in header.find_next_siblings():
                if sibling.name in ['h2', 'h3', 'h4']:
                    break
                if sibling.name in ['p', 'ul', 'ol']:
                    next_content.append(sibling.get_text())
                if len(' '.join(next_content)) > 500:
                    break
            if next_content:
                approaches.append(f"{approach_text}: {' '.join(next_content)[:500]}")
        
        result['approach'] = '\n\n'.join(approaches) if approaches else ''
        
        # Extract complexity information
        complexity_text = article.find(string=re.compile(r'(time complexity|space complexity|O\([^)]+\))', re.I))
        if complexity_text:
            # Get parent element's text for context
            parent = complexity_text.find_parent()
            if parent:
                result['complexity'] = clean_text(parent.get_text())[:200]
        
        # Extract code examples (just one clean example, preferably Python)
        code_blocks = article.find_all(['pre', 'code'])
        python_code = None
        other_code = None
        
        for code_block in code_blocks:
            code_text = code_block.get_text()
            if len(code_text) > 50:  # Skip tiny snippets
                # Check if it's Python
                if 'def ' in code_text or 'print(' in code_text or '# ' in code_text:
                    if not python_code:
                        python_code = clean_code(code_text)
                elif not other_code:
                    other_code = clean_code(code_text)
        
        # Prefer Python, fallback to other
        if python_code:
            result['code_examples'].append({'language': 'Python', 'code': python_code[:1500]})
        elif other_code:
            result['code_examples'].append({'language': 'Code', 'code': other_code[:1500]})
        
        # Extract key points (bullet points or numbered lists)
        lists = article.find_all(['ul', 'ol'], limit=2)
        for lst in lists:
            items = lst.find_all('li', limit=5)
            for item in items:
                item_text = clean_text(item.get_text())
                if 20 < len(item_text) < 200:  # Meaningful points
                    result['key_points'].append(item_text)
    
    return result


def clean_code(code: str) -> str:
    """
    Clean code snippet for better readability
    """
    # Remove excessive blank lines
    lines = code.split('\n')
    cleaned_lines = []
    blank_count = 0
    
    for line in lines:
        if line.strip() == '':
            blank_count += 1
            if blank_count <= 1:  # Allow max 1 blank line
                cleaned_lines.append('')
        else:
            blank_count = 0
            cleaned_lines.append(line.rstrip())
    
    return '\n'.join(cleaned_lines)


def format_for_llm(structured_content: dict, url: str) -> str:
    """
    Format structured content into clean, readable text for LLM
    """
    parts = []
    
    # Title
    if structured_content['title']:
        parts.append(f"## {structured_content['title']}")
        parts.append(f"Source: {url}\n")
    
    # Problem Statement
    if structured_content['problem_statement']:
        parts.append("### Problem Description")
        parts.append(structured_content['problem_statement'])
        parts.append("")
    
    # Approach
    if structured_content['approach']:
        parts.append("### Approach/Solution")
        parts.append(structured_content['approach'])
        parts.append("")
    
    # Complexity
    if structured_content['complexity']:
        parts.append("### Complexity")
        parts.append(structured_content['complexity'])
        parts.append("")
    
    # Key Points
    if structured_content['key_points']:
        parts.append("### Key Points")
        for point in structured_content['key_points'][:5]:
            parts.append(f"• {point}")
        parts.append("")
    
    # Code Example
    if structured_content['code_examples']:
        parts.append("### Code Example")
        for example in structured_content['code_examples'][:1]:  # Just one example
            parts.append(f"```{example['language'].lower()}")
            parts.append(example['code'])
            parts.append("```")
    
    return '\n'.join(parts)



def search_serper(query: str, num_results: int = 5) -> list:
    """
    Search Google using Serper.dev API to avoid rate limiting and get reliable results
    """
    if not SERPER_API_KEY:
        print("⚠️ SERPER_API_KEY not configured", file=sys.stderr)
        return []

    enhanced_query = f"{query} geeksforgeeks"
    
    try:
        url = "https://google.serper.dev/search"
        payload = json.dumps({
            "q": enhanced_query,
            "num": num_results
        })
        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }
        
        print(f"🔍 Searching Serper.dev for: '{enhanced_query}'...", file=sys.stderr)
        response = session.post(url, headers=headers, data=payload, timeout=20)
        
        if response.status_code == 401:
            print("❌ Serper.dev error: 401 Unauthorized (Invalid API Key)", file=sys.stderr)
            return []
            
        response.raise_for_status()
        
        data = response.json()
        results = []
        
        if "organic" in data:
            for result in data["organic"]:
                link = result.get("link")
                title = result.get("title")
                
                # Prioritize GeeksforGeeks URLs
                if link and "geeksforgeeks.org" in link.lower():
                    results.append({'title': title, 'url': link})
        
        print(f"✅ Serper.dev found {len(results)} GeeksforGeeks results", file=sys.stderr)
        return results
        
    except Exception as e:
        print(f"❌ Serper.dev error: {e}", file=sys.stderr)
        return []


def search_youtube_videos(query: str, num_results: int = 6) -> list:
    """
    Search specifically for YouTube videos using Serper.dev
    """
    if not SERPER_API_KEY:
        print("⚠️ SERPER_API_KEY not configured", file=sys.stderr)
        return []
        
    # Search for youtube.com specifically
    enhanced_query = f"site:youtube.com {query}"
    
    try:
        url = "https://google.serper.dev/search"
        payload = json.dumps({
            "q": enhanced_query,
            "num": num_results
        })
        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }
        
        print(f"📹 Searching YouTube videos for: '{query}'...", file=sys.stderr)
        response = session.post(url, headers=headers, data=payload, timeout=20)
        
        if response.status_code != 200:
            print(f"❌ Serper.dev video search error: {response.status_code}", file=sys.stderr)
            return []
            
        data = response.json()
        videos = []
        
        # Check organic results for YouTube links
        if "organic" in data:
            for result in data["organic"]:
                link = result.get("link", "")
                title = result.get("title", "")
                snippet = result.get("snippet", "")
                
                if "youtube.com/watch" in link:
                    # Extract video ID
                    video_id_match = re.search(r'v=([^&]+)', link)
                    if video_id_match:
                        video_id = video_id_match.group(1)
                        # Construct thumbnail URL (high quality)
                        thumbnail = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
                        
                        videos.append({
                            'id': video_id,
                            'title': title,
                            'url': link,
                            'thumbnail': thumbnail,
                            'description': snippet
                        })
        
        print(f"✅ Found {len(videos)} YouTube videos", file=sys.stderr)
        return videos
        
    except Exception as e:
        print(f"❌ Error specific searching videos: {e}", file=sys.stderr)
        return []


def scrape_and_structure(url: str) -> str:
    """
    Scrape URL and return clean, structured content
    """
    try:
        print(f"   📥 Fetching: {url}", file=sys.stderr)
        response = session.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract structured content
        structured = extract_structured_content(soup, url)
        
        # Format for LLM
        formatted = format_for_llm(structured, url)
        
        char_count = len(formatted)
        print(f"   ✅ Extracted {char_count} clean characters", file=sys.stderr)
        
        return formatted
        
    except Exception as e:
        print(f"   ❌ Error: {e}", file=sys.stderr)
        return ""


def get_context_for_question(question: str) -> dict:
    """
    Main function: Search and scrape to get clean context for LLM
    Returns dict with 'context' and 'sources' for citation
    """
    # Sanitize question to avoid sending huge blobs to search API
    # Take first meaningful line
    search_query = question.split('\n')[0][:150].strip()
    if not search_query:
        search_query = question[:100].strip()

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"🐍 PYTHON SCRAPER (Serper.dev + Beautiful Soup)", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"📝 Full Question Length: {len(question)} chars", file=sys.stderr)
    print(f"🔍 Optimized Search Query: {search_query}", file=sys.stderr)
    print(f"{'-'*60}", file=sys.stderr)
    
    # Use Serper.dev for searching
    results = search_serper(search_query, num_results=5)
    
    if not results:
        print("No results found via Serper.dev", file=sys.stderr)
        return {"context": "", "sources": []}
    
    # Scrape and structure (top 2 results for quality)
    print(f"\n🌐 SCRAPING & STRUCTURING CONTENT...", file=sys.stderr)
    print(f"{'-'*60}", file=sys.stderr)
    
    context_parts = []
    sources = []  # Track sources for citation
    
    for result in results[:2]:
        content = scrape_and_structure(result['url'])
        if content and len(content) > 200:
            context_parts.append(content)
            # Add source for citation
            sources.append({
                'title': result.get('title', 'GeeksforGeeks Article'),
                'url': result['url']
            })
    
    if not context_parts:
        print("Could not extract structured content", file=sys.stderr)
        return {"context": "", "sources": []}
    
    # Combine with separator
    context = "\n\n---\n\n".join(context_parts)
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"📦 CLEAN STRUCTURED CONTEXT FOR LLM", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"📊 Total: {len(context)} clean characters", file=sys.stderr)
    print(f"📚 Sources: {len(sources)} articles", file=sys.stderr)
    print(f"{'-'*60}", file=sys.stderr)
    print(context[:2000], file=sys.stderr)  # Preview
    if len(context) > 2000:
        print(f"... [truncated for display, full {len(context)} chars sent to LLM]", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)
    
    return {"context": context, "sources": sources}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No question provided"}))
        sys.exit(1)
    
    command = "context"
    if len(sys.argv) >= 3 and sys.argv[1] == "--videos":
        command = "videos"
        question = " ".join(sys.argv[2:])
    else:
        question = " ".join(sys.argv[1:])

    if command == "videos":
        videos = search_youtube_videos(question)
        print(json.dumps({"videos": videos}))
    else:
        result = get_context_for_question(question)
        print(json.dumps(result))  # Now returns {"context": "...", "sources": [...]}
