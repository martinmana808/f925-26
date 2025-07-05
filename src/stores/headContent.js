// src/stores/headContent.js
import { writable } from 'svelte/store';

export const headContent = writable({
    title: 'Martin Mana • AI-driven digital developer',
    description: 'I integrate cutting-edge AI automation with UX, UI, and performance-focused design. I create beautiful and intelligent products that people love and praise.',
    canonical: '',
    ogImage: '/og-1200x630.png',
    ogType: 'website',
    links: [],
    scripts: []
});

// SEO configuration for each route
export const seoConfig = {
    '/': {
        title: 'Martin Mana • AI-driven digital developer',
        description: 'I integrate cutting-edge AI automation with UX, UI, and performance-focused design. I create beautiful and intelligent products that people love and praise.',
        canonical: 'https://martinmana.com/'
    },
    '/about': {
        title: 'About • Martin Mana',
        description: 'Learn about Martin Mana, an AI-driven digital developer specializing in UX, UI, and performance-focused design.',
        canonical: 'https://martinmana.com/about'
    },
    '/services': {
        title: 'Services • Martin Mana',
        description: 'Explore our comprehensive digital services including AI solutions, web development, app development, UX/UI design, and graphic design.',
        canonical: 'https://martinmana.com/services'
    },
    '/services/ai-solutions': {
        title: 'AI Solutions • Martin Mana',
        description: 'Cutting-edge AI automation solutions that enhance user experience and streamline business processes.',
        canonical: 'https://martinmana.com/services/ai-solutions'
    },
    '/services/website-development': {
        title: 'Website Development • Martin Mana',
        description: 'Performance-focused website development with modern technologies and best practices.',
        canonical: 'https://martinmana.com/services/website-development'
    },
    '/services/app-development': {
        title: 'App Development • Martin Mana',
        description: 'Native and cross-platform mobile app development with intuitive user interfaces.',
        canonical: 'https://martinmana.com/services/app-development'
    },
    '/services/ux-ui-design': {
        title: 'UX/UI Design • Martin Mana',
        description: 'User-centered design solutions that create engaging and intuitive digital experiences.',
        canonical: 'https://martinmana.com/services/ux-ui-design'
    },
    '/services/graphic-design': {
        title: 'Graphic Design • Martin Mana',
        description: 'Creative graphic design solutions for branding, marketing, and visual communication.',
        canonical: 'https://martinmana.com/services/graphic-design'
    },
    '/work': {
        title: 'Work • Martin Mana',
        description: 'Portfolio showcasing innovative digital projects and creative solutions.',
        canonical: 'https://martinmana.com/work'
    },
    '/contact': {
        title: 'Book a Free Call • Martin Mana',
        description: 'Schedule a free consultation call to discuss your next digital project or collaboration opportunity.',
        canonical: 'https://martinmana.com/contact'
    },
    '/contact2': {
        title: 'Drop Me a Line • Martin Mana',
        description: 'Send me a message directly. I\'ll get back to you as soon as possible to discuss your project.',
        canonical: 'https://martinmana.com/contact2'
    },
    '/stuff': {
        title: 'Stuff • Martin Mana',
        description: 'Thoughts, experiments, and insights on technology and design.',
        canonical: 'https://martinmana.com/stuff'
    },
    '/stuff/llms': {
        title: 'LLMs • Martin Mana',
        description: 'Exploring large language models and their applications in modern development.',
        canonical: 'https://martinmana.com/stuff/llms'
    },
    '/404': {
        title: 'Page Not Found • Martin Mana',
        description: 'The page you are looking for could not be found. Please check the URL or return to the home page.',
        canonical: 'https://martinmana.com/404'
    }
};
