// src/stores/headContent.js
import { writable } from 'svelte/store';

export const headContent = writable({
    title: 'F925 • AI-native website products & platforms',
    description: 'F925 designs and builds website products, platforms, and AI systems that actually work — chatbots, automation, and intelligent products woven through with AI.',
    canonical: '',
    ogImage: '/og-1200x630.png',
    ogType: 'website',
    links: [],
    scripts: []
});

// SEO configuration for each route
export const seoConfig = {
    '/': {
        title: 'F925 • AI-native website products & platforms',
        description: 'F925 designs and builds website products, platforms, and AI systems that actually work — chatbots, automation, and intelligent products woven through with AI.',
        canonical: 'https://f925.works/'
    },
    '/about': {
        title: 'About • F925',
        description: 'F925 is an AI-native studio. We build website products, platforms, and AI systems — chatbots, agents, and automation — for businesses that need things to work properly.',
        canonical: 'https://f925.works/about'
    },
    '/services': {
        title: 'Services • F925',
        description: 'Website products & platforms, AI agents & chatbots, and automation & systems — outcome-led, AI-native builds from F925.',
        canonical: 'https://f925.works/services'
    },
    '/services/website-products': {
        title: 'Website Products & Platforms • F925',
        description: 'We design and build websites, web apps, and platforms that actually work — fast, intelligent, and woven through with AI. Not brochures.',
        canonical: 'https://f925.works/services/website-products'
    },
    '/services/ai-agents': {
        title: 'AI Agents & Chatbots • F925',
        description: 'Custom AI assistants like Gary: RAG + actions, lead-generation chat, and support agents trained on your business.',
        canonical: 'https://f925.works/services/ai-agents'
    },
    '/services/automation': {
        title: 'Automation & Systems • F925',
        description: 'Process automation and deep integrations — CRM, ERP, POS, pipelines. Processes without automation are just work.',
        canonical: 'https://f925.works/services/automation'
    },
    '/portfolio': {
        title: 'Portfolio • F925',
        description: 'A look at the work — websites, products, branding, and design built by F925.',
        canonical: 'https://f925.works/portfolio'
    },
    '/contact': {
        title: 'Contact • F925',
        description: 'Contact us to discuss your website product, platform, or AI build with F925.',
        canonical: 'https://f925.works/contact'
    },
    '/contact2': {
        title: 'Drop Us a Line • F925',
        description: 'Send F925 a message. We\'ll get back to you as soon as possible to discuss your project.',
        canonical: 'https://f925.works/contact2'
    },
    '/404': {
        title: 'Page Not Found • F925',
        description: 'The page you are looking for could not be found. Please check the URL or return to the home page.',
        canonical: 'https://f925.works/404'
    }
};
