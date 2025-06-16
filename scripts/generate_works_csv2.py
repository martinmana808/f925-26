import os
import csv
from PIL import Image

# Use absolute paths
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
images_dir = os.path.join(base_dir, "public", "assets", "images", "works")
csv_path = os.path.join(base_dir, "public", "assets", "data", "works.csv")

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
    existing_rows = {}
    if os.path.exists(csv_path):
        with open(csv_path, "r", newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader)
            for row in reader:
                if row:
                    existing_rows[row[0]] = row

    skipped_files = []
    new_files = []
    deleted_files = []

    # Collect all rows first
    all_rows = []
    
    # Add existing rows that are still present
    for filename, row in existing_rows.items():
        if filename in files:
            # Preserve the SHOW value if it exists, otherwise add 'yes'
            if len(row) > 6:
                all_rows.append(row)
            else:
                all_rows.append(row + ['yes'])
        else:
            deleted_files.append(filename)
            print(f"Removed missing image from CSV: {filename}")

    # Add new rows
    for filename in files:
        if filename in existing_rows:
            skipped_files.append(filename)
            continue
        title = make_title(filename)
        aspect_ratio = get_aspect_ratio(os.path.join(images_dir, filename))
        all_rows.append([filename, title, "", "", aspect_ratio, "", "yes"])
        new_files.append(filename)

    # Sort all rows by filename (first column)
    all_rows.sort(key=lambda x: x[0].lower())

    # Write sorted rows to CSV
    with open(csv_path, "w", newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["filename", "title", "category", "description", "aspect_ratio", "url", "show"])
        writer.writerows(all_rows)

    if deleted_files:
        print("\nDeleted files (no longer in images directory):")
        for name in deleted_files:
            print(f" - {name}")

    if skipped_files:
        print("\nSkipped existing files (already in CSV):")
        for name in skipped_files:
            print(f" - {name}")

    if new_files:
        print("\nAdded new files to CSV:")
        for name in new_files:
            print(f" - {name}")

    print(f"\nCSV generated with {len(files)} entries at {csv_path}")
    print(f"Summary: {len(new_files)} new, {len(skipped_files)} existing, {len(deleted_files)} deleted")

if __name__ == "__main__":
    generate_csv(images_dir, csv_path)
