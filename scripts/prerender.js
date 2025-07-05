import fs from 'fs';
import path from 'path';

// Routes to prerender
const routes = [
    '/',
    '/about',
    '/services',
    '/services/ai-solutions',
    '/services/website-development',
    '/services/app-development',
    '/services/ux-ui-design',
    '/services/graphic-design',
    '/work',
    '/contact',
    '/contact2',
    '/stuff',
    '/stuff/llms'
];

// Base HTML template
const htmlTemplate = (route, title, description) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="https://martinmana.com${route}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://martinmana.com${route}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="/og-1200x630.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://martinmana.com${route}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="/og-1200x630.png">

    <link rel="icon" href="/favicon.png" sizes="any">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#222222">
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
    
    <!-- Preload critical fonts -->
    <link rel="preload" href="/src/assets/fonts/bentonsanscomp-black-webfont.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="/src/assets/fonts/bentonsanscond-black-webfont.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="/src/assets/fonts/bentonsansextracomp-black-webfont.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    
    <!-- Critical CSS -->
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .loading { opacity: 0; }
        .prerender-content { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: #000; 
            color: #fff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            z-index: 9999; 
        }
        .prerender-content h1 { 
            font-size: 2rem; 
            margin: 0; 
            text-align: center; 
        }
        .prerender-content p { 
            font-size: 1rem; 
            margin: 1rem 0 0 0; 
            opacity: 0.8; 
            text-align: center; 
        }
    </style>
</head>
<body class="loading">
    <div class="prerender-content">
        <div>
            <h1>Martin Mana</h1>
            <p>${description}</p>
        </div>
    </div>
    
    <div id="app"></div>
    
    <!-- The actual app will be loaded by the SPA router -->
    <script type="module" src="/assets/index-By7UIU4k.js"></script>
    <script>
        // Remove prerender content when app loads
        window.addEventListener('load', () => {
            const prerenderContent = document.querySelector('.prerender-content');
            if (prerenderContent) {
                prerenderContent.style.display = 'none';
            }
            document.body.classList.remove('loading');
        });
    </script>
</body>
</html>`;

// SEO data for each route
const seoData = {
    '/': {
        title: 'Martin Mana • AI-driven digital developer',
        description: 'I integrate cutting-edge AI automation with UX, UI, and performance-focused design. I create beautiful and intelligent products that people love and praise.'
    },
    '/about': {
        title: 'About • Martin Mana',
        description: 'Learn about Martin Mana, an AI-driven digital developer specializing in UX, UI, and performance-focused design.'
    },
    '/services': {
        title: 'Services • Martin Mana',
        description: 'Explore our comprehensive digital services including AI solutions, web development, app development, UX/UI design, and graphic design.'
    },
    '/services/ai-solutions': {
        title: 'AI Solutions • Martin Mana',
        description: 'Cutting-edge AI automation solutions that enhance user experience and streamline business processes.'
    },
    '/services/website-development': {
        title: 'Website Development • Martin Mana',
        description: 'Performance-focused website development with modern technologies and best practices.'
    },
    '/services/app-development': {
        title: 'App Development • Martin Mana',
        description: 'Native and cross-platform mobile app development with intuitive user interfaces.'
    },
    '/services/ux-ui-design': {
        title: 'UX/UI Design • Martin Mana',
        description: 'User-centered design solutions that create engaging and intuitive digital experiences.'
    },
    '/services/graphic-design': {
        title: 'Graphic Design • Martin Mana',
        description: 'Creative graphic design solutions for branding, marketing, and visual communication.'
    },
    '/work': {
        title: 'Work • Martin Mana',
        description: 'Portfolio showcasing innovative digital projects and creative solutions.'
    },
    '/contact': {
        title: 'Book a Free Call • Martin Mana',
        description: 'Schedule a free consultation call to discuss your next digital project or collaboration opportunity.'
    },
    '/contact2': {
        title: 'Drop Me a Line • Martin Mana',
        description: 'Send me a message directly. I\'ll get back to you as soon as possible to discuss your project.'
    },
    '/stuff': {
        title: 'Stuff • Martin Mana',
        description: 'Thoughts, experiments, and insights on technology and design.'
    },
    '/stuff/llms': {
        title: 'LLMs • Martin Mana',
        description: 'Exploring large language models and their applications in modern development.'
    }
};

function generatePrerenderedPages() {
    const distPath = path.join(process.cwd(), 'dist');
    
    routes.forEach(route => {
        const seo = seoData[route];
        const html = htmlTemplate(route, seo.title, seo.description);
        
        // Create directory structure if needed
        let filePath;
        if (route === '/') {
            // Skip the root route - let Vite handle the main index.html
            console.log('Skipping root route - using Vite-generated index.html');
            return;
        } else {
            const dirPath = path.join(distPath, route.substring(1));
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            filePath = path.join(dirPath, 'index.html');
        }
        
        fs.writeFileSync(filePath, html);
        console.log(`Generated prerendered page: ${filePath}`);
    });
}

generatePrerenderedPages();
console.log('Prerendering complete!'); 
