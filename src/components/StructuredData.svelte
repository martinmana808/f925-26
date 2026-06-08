<script>
    export let type = 'website';
    export let title = '';
    export let description = '';
    export let url = '';
    export let image = '';
    export let author = 'F925';
    export let organization = {
        name: 'F925',
        url: 'https://f925.ai',
        logo: 'https://f925.ai/logo.svg'
    };

    // Generate structured data based on type
    function generateStructuredData() {
        const baseData = {
            '@context': 'https://schema.org',
            '@type': type === 'person' ? 'Person' : 'WebPage',
            name: title,
            description: description,
            url: url,
            author: {
                '@type': 'Person',
                name: author,
                url: organization.url
            },
            publisher: {
                '@type': 'Organization',
                name: organization.name,
                url: organization.url,
                logo: {
                    '@type': 'ImageObject',
                    url: organization.logo
                }
            }
        };

        if (image) {
            baseData.image = {
                '@type': 'ImageObject',
                url: image
            };
        }

        if (type === 'person') {
            return {
                '@context': 'https://schema.org',
                '@type': 'Person',
                name: author,
                url: organization.url,
                jobTitle: 'AI-native digital studio',
                description: description,
                knowsAbout: ['AI Automation', 'AI Agents', 'Chatbots', 'Web Development', 'Web Platforms', 'Product Design'],
                worksFor: {
                    '@type': 'Organization',
                    name: organization.name,
                    url: organization.url
                }
            };
        }

        return baseData;
    }

    $: structuredData = generateStructuredData();
</script>

<svelte:head>
    <script type="application/ld+json">
        {JSON.stringify(structuredData)}
    </script>
</svelte:head> 
