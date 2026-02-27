import os
import re

# Unsplash images for each article topic
images = {
    "01-best-ai-tools-small-business-2024.html": {
        "hero": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&h=600&fit=crop",
        "alt": "AI tools dashboard on laptop screen"
    },
    "02-chatgpt-vs-claude-business-2024.html": {
        "hero": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
        "alt": "ChatGPT and Claude AI comparison"
    },
    "03-how-to-automate-small-business-with-ai.html": {
        "hero": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop",
        "alt": "Business automation workflow diagram"
    },
    "04-zapier-ai-automation-guide.html": {
        "hero": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
        "alt": "Zapier automation workflow"
    },
    "05-ai-content-creation-tools-comparison.html": {
        "hero": "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=600&fit=crop",
        "alt": "Content creation with AI writing tools"
    },
    "06-make-vs-zapier-comparison.html": {
        "hero": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
        "alt": "Automation platform comparison chart"
    },
    "07-ai-customer-service-tools-small-business.html": {
        "hero": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
        "alt": "Customer service representative using AI chatbot"
    },
    "08-notion-ai-review-2024.html": {
        "hero": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=600&fit=crop",
        "alt": "Notion workspace with AI features"
    },
    "09-ai-marketing-tools-beginners.html": {
        "hero": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop",
        "alt": "Digital marketing dashboard with AI analytics"
    },
    "10-save-10-hours-week-ai-tools.html": {
        "hero": "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1200&h=600&fit=crop",
        "alt": "Productive workspace with laptop and coffee"
    },
    "11-midjourney-vs-dalle-business.html": {
        "hero": "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&h=600&fit=crop",
        "alt": "AI generated artwork comparison"
    },
    "12-ai-tools-cost-vs-hiring-comparison.html": {
        "hero": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop",
        "alt": "Business cost analysis spreadsheet"
    }
}

articles_dir = "articles"

for filename, img_data in images.items():
    filepath = os.path.join(articles_dir, filename)
    
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find the first <h1> tag and add image after it
    h1_pattern = r'(<h1[^>]*>.*?</h1>)'
    
    image_html = f'''
        <div class="article-hero-image" style="margin: 2rem 0;">
            <img src="{img_data['hero']}" alt="{img_data['alt']}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px;">
        </div>
    '''
    
    # Insert image after h1
    content = re.sub(h1_pattern, r'\1' + image_html, content, count=1)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✅ Added image to {filename}")

print(f"\n✅ Updated {len(images)} articles with hero images from Unsplash")
