import urllib.request
import re

def scrape_title(url):
    """
    Scrapes the title from a given URL.
    """
    try:
        with urllib.request.urlopen(url) as response:
            # Read and decode the response content
            html = response.read().decode('utf-8', errors='ignore')
            
            # Use a simple regex to find the content of the <title> tag
            title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            
            if title_match:
                return title_match.group(1).strip()
            else:
                return "No title found."
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == "__main__":
    # Example usage:
    target_url = "https://example.com"
    print(f"Scraping title from: {target_url}")
    
    title = scrape_title(target_url)
    print(f"Title: {title}")

    # You can try another URL by uncommenting the lines below
    # target_url_2 = "https://news.google.com"
    # print(f"\nScraping title from: {target_url_2}")
    # title_2 = scrape_title(target_url_2)
    # print(f"Title: {title_2}")
