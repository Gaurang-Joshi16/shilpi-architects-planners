import fitz
import os
import glob
import re

news_dir = "public/News"

for folder in os.listdir(news_dir):
    folder_path = os.path.join(news_dir, folder)
    if not os.path.isdir(folder_path):
        continue
        
    pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))
    if not pdf_files:
        continue
        
    pdf_path = pdf_files[0]
    print(f"\n================ {folder} ================")
    
    doc = fitz.open(pdf_path)
    
    image_count = 1
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Get dictionary format
        page_dict = page.get_text("dict")
        blocks = page_dict["blocks"]
        
        # Sort blocks by y0 (vertical position)
        blocks.sort(key=lambda b: b["bbox"][1])
        
        for b in blocks:
            if b["type"] == 1:
                # Image block
                print(f"[IMAGE] {image_count}.jpeg")
                image_count += 1
            elif b["type"] == 0:
                # Text block
                text = ""
                for line in b["lines"]:
                    for span in line["spans"]:
                        text += span["text"] + " "
                text = text.strip()
                if not text: continue
                # Skip the title if it matches the folder roughly, or just print the first 50 chars
                clean_text = re.sub(r'\s+', ' ', text)
                if len(clean_text) > 10:
                    print(f"[TEXT] {clean_text[:60]}...")
