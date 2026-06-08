import fs from 'fs';
import path from 'path';

// Define all the routes in your application
const routes = [
    {
        url: '/',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '1.0'
    },
    {
        url: '/about',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
    },
    {
        url: '/services',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.9'
    },
    {
        url: '/services/website-products',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
    },
    {
        url: '/services/ai-agents',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
    },
    {
        url: '/services/automation',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
    },
    {
        url: '/portfolio',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.9'
    },
    {
        url: '/contact',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.7'
    },
    {
        url: '/contact2',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.7'
    }
];

// Base URL - replace with your actual domain
const baseUrl = 'https://f925.ai';

// Generate sitemap XML
function generateSitemap() {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    routes.forEach(route => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${route.url}</loc>\n`;
        sitemap += `    <lastmod>${route.lastmod}</lastmod>\n`;
        sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${route.priority}</priority>\n`;
        sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    return sitemap;
}

// Write sitemap to dist directory
const sitemapContent = generateSitemap();
const distPath = path.join(process.cwd(), 'dist');
const sitemapPath = path.join(distPath, 'sitemap.xml');

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
}

fs.writeFileSync(sitemapPath, sitemapContent);
console.log('Sitemap generated successfully at:', sitemapPath); 
