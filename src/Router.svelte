<script>
    import Test from './routes/Test.svelte' 
    import Home from './routes/Home.svelte'
    import About from './routes/About.svelte'
    import Services from './routes/Services/index.svelte'
    import AiSolutions from './routes/Services/AiSolutions.svelte'
    import WebsiteDevelopment from './routes/Services/WebsiteDevelopment.svelte'
    import AppDevelopment from './routes/Services/AppDevelopment.svelte'
    import UXUIDesign from './routes/Services/UXUIDesign.svelte'
    import GraphicDesign from './routes/Services/GraphicDesign.svelte'
    import Work from './routes/Work.svelte'
    import Contact from './routes/Contact.svelte'
    import Contact2 from './routes/Contact2.svelte'
    import FourOhFour from './routes/404.svelte'
    import Stuff from './routes/Stuff/index.svelte'
    import StuffLlms from './routes/Stuff/llms.svelte'
    import { headContent, seoConfig } from './stores/headContent.js'
    import { onMount } from 'svelte'

    let currentRoute = window.location.pathname

    // Define the routes
    const routes = {
        '/test': Test, 
        '/': Home,
        '/about': About,
        '/services': Services,
        '/services/ai-solutions': AiSolutions,
        '/services/website-development': WebsiteDevelopment,
        '/services/app-development': AppDevelopment,
        '/services/ux-ui-design': UXUIDesign,
        '/services/graphic-design': GraphicDesign,
        '/work': Work,
        '/contact': Contact,
        '/contact2': Contact2,
        '/stuff': Stuff,
        '/stuff/llms': StuffLlms
    }

    // If the route exists, use it; otherwise, go to 404 page
    let currentPage = routes[currentRoute] || FourOhFour

    // Update SEO meta tags when route changes
    function updateSEO() {
        const seo = seoConfig[currentRoute] || seoConfig['/']
        headContent.set({
            title: seo.title,
            description: seo.description,
            canonical: seo.canonical,
            ogImage: '/og-1200x630.png',
            ogType: 'website',
            links: [],
            scripts: []
        })
    }

    onMount(() => {
        updateSEO()
        
        // Listen for route changes
        const handleRouteChange = () => {
            currentRoute = window.location.pathname
            currentPage = routes[currentRoute] || FourOhFour
            updateSEO()
        }

        window.addEventListener('popstate', handleRouteChange)
        
        return () => {
            window.removeEventListener('popstate', handleRouteChange)
        }
    })
</script>

<svelte:component this={currentPage} />
