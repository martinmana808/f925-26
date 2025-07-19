## 🚀 Development & Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deployment Process
The build process now includes automatic SEO optimization:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **What happens automatically during build:**
   - ✅ Generates `/sitemap.xml` with all routes
   - ✅ Creates prerendered static HTML files for all pages (improves SEO)
   - ✅ Copies all assets and configuration files
   - ✅ Optimizes images and generates low-res versions

3. **Deploy the `dist/` folder** to your hosting platform (Netlify, Vercel, etc.)

### SEO Features
- **Sitemap**: Automatically generated at `/sitemap.xml`
- **Prerendered Pages**: All routes have static HTML for better crawlability
- **Meta Tags**: Dynamic titles, descriptions, and Open Graph tags
- **Structured Data**: JSON-LD for better search engine understanding
- **Canonical URLs**: Proper canonical links for all pages
- **Robots.txt**: Configured with sitemap reference

# Project Tasks and Goals

Adaptive. Be a generalist. 
Today beinga  jack of all trades is the ebst.
A generalist. Specialists are not needed. 

Soy mi cliente numero 1. Estoy tratando de hacer todo en mi vida con ai, para de esa manera poder saber realmente como ayudar a mis clientes. 

## 📋 Works pendientes
Majestad planos y majestad 3d nuevo pro 
Logo Ultimo dia viejo
LOGO NUEVO, 2 versiones
Editorial girondo
Editorial revista faso
Editorial vitis
LOGO MUTANTES
meter mas laburos de frontend en gravitate. Meter los links, y los mockups extendidos. ocupar espacio. 
     - harrisons
     - spca
     - arvida
     - laser
     -
GO BACK works page to not be white masonry but body color
- hacer click sobre imagen que sea mas grande de lo q esta renderizada to real pixels size?

::::::: ;; : : : : OOOPPPPTIIIIIMIIIIIZZZZZAAAAARRRR IMAGEEEENEEEEESSSSS

## 📋 Suggestions
- Blog/News/Pensamientos section.
    Esto que lea un feed de los mas grosos (tagueandolos) y cree los articulos automaticamente.
Allow for gifs in listing and detail pages
Implement different images for listing and detail pages
Have a way to share a single category, like a public standalon url


### High Priority
- service detail page texts improvements



#### How to update works, what to run, and how to do it

1. **Add or remove images**
   - Place new `.webp` images in `public/assets/images/works`.
   - Remove any images you no longer want from that folder.

2. **Update works data and generate low-res images**
   - Run the following command to update the works CSV and generate low-res images:
     ```bash
     bash scripts/update-works.sh
     ```
   - This will:
     - Update `public/assets/data/works.csv` with all images in the folder
     - Generate low-res images in `public/assets/images/works--low`

3. **Edit works.csv**
   - Open `public/assets/data/works.csv` in your preferred editor.
   - Update titles, descriptions, categories, and the `show` column as needed.

4. **Generate or update categories.csv**
   - After saving your changes to `works.csv`, run:
     ```bash
     python3 scripts/generate_categories_csv.py
     ```
   - This will create or update `public/assets/data/categories.csv` with all unique categories found in `works.csv`.
   - You can then edit `categories.csv` to enable/disable entire categories by setting the `show` column to `yes` or `no`.

5. **Enable/disable works or categories**
   - To hide/show individual works, set their `show` column in `works.csv` to `no` or `yes`.
   - To hide/show all works in a category, set the `show` column in `categories.csv` to `no` or `yes`.

**Summary:**
- Add/remove images → run `update-works.sh` → edit `works.csv` → run `generate_categories_csv.py` → edit `categories.csv` as needed.
