import os
import csv

# Paths (relative to this script's location)
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
works_csv_path = os.path.join(base_dir, "public", "assets", "data", "works.csv")
categories_csv_path = os.path.join(base_dir, "public", "assets", "data", "categories.csv")

def read_categories_from_works(works_csv_path):
    categories = set()
    with open(works_csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            cat_field = row.get('category', '')
            if cat_field:
                # Split by comma, trim whitespace, and add each non-empty category
                for cat in cat_field.split(','):
                    cat = cat.strip()
                    if cat:
                        categories.add(cat)
    return sorted(categories, key=lambda x: x.lower())

def read_existing_category_status(categories_csv_path):
    status = {}
    if os.path.exists(categories_csv_path):
        with open(categories_csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                cat = row.get('category', '').strip()
                show = row.get('show', 'yes').strip().lower()
                if cat:
                    status[cat] = show
    return status

def write_categories_csv(categories, existing_status, categories_csv_path):
    with open(categories_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['category', 'show'])
        for cat in categories:
            show = existing_status.get(cat, 'yes')
            writer.writerow([cat, show])

def main():
    if not os.path.exists(works_csv_path):
        print(f"Error: {works_csv_path} not found.")
        return
    categories = read_categories_from_works(works_csv_path)
    existing_status = read_existing_category_status(categories_csv_path)
    write_categories_csv(categories, existing_status, categories_csv_path)
    print(f"categories.csv generated/updated with {len(categories)} categories.")

if __name__ == "__main__":
    main() 
