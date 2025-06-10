import os
import csv
from PIL import Image

images_dir = "../public/assets/images/works"  # Add ../ to go up one directory
csv_path = "../public/assets/data/works.csv"  # Update this path too

def make_title(filename):
    name = os.path.splitext(filename)[0]
    name = name.replace("-", " ").replace("_", " ")
    return name.title()

def get_aspect_ratio(filepath):
    with Image.open(filepath) as img:
        width, height = img.size
        return f"{width}/{height}"

def generate_csv(images_dir, csv_path):
    files = sorted(f for f in os.listdir(images_dir) if f.lower().endswith('.webp'))
    with open(csv_path, "w", newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["filename", "title", "category", "description", "aspect_ratio", "url"])
        for filename in files:
            title = make_title(filename)
            aspect_ratio = get_aspect_ratio(os.path.join(images_dir, filename))
            writer.writerow([filename, title, "", "", aspect_ratio, ""])
    print(f"CSV generated with {len(files)} entries at {csv_path}")

if __name__ == "__main__":
    generate_csv(images_dir, csv_path)
