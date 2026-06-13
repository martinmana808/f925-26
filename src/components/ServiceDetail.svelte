<script>
    export let serviceDetails
    export let activeTab
    export let setActiveTab
    function slugify(title) {
        return title.toLowerCase().replace(/\s+/g, '-')
    }
    export let type
    import Icon from '../components/Icon.svelte'
    // import lighthouseMockup from '../assets/images/services--bespoke.png'
</script>

{#if serviceDetails.length > 0}
    {#each serviceDetails as serviceDetail}
        <div
            id="services-lvl2--{slugify(serviceDetail.title)}"
            class="services-lvl2"
            style="display: {activeTab === 'services-lvl2--' + slugify(serviceDetail.title) ? 'block' : 'none'};">
            {#if serviceDetail.linkDemo}
                {#if serviceDetail.linkDemo.includes('http')}
                    <a
                        href={serviceDetail.linkDemo}
                        class="services-lvl2--url l-visible"
                        target="_blank"
                        rel="noopener">
                        <Icon name="external" />
                        <span>
                            {#if serviceDetail.linkLabel}
                                {serviceDetail.linkLabel}
                            {:else}
                                {serviceDetail.linkDemo}
                            {/if}
                        </span>
                    </a>
                {:else}
                    <a href={serviceDetail.linkDemo} class="services-lvl2--url l-visible">
                        <span>
                            {#if serviceDetail.linkLabel}
                                {serviceDetail.linkLabel}
                            {:else}
                                {serviceDetail.linkDemo}
                            {/if}
                        </span>
                    </a>
                {/if}
            {/if}
            <div class="services-lvl2--side"></div>
            {#if serviceDetail.altTitle}
                <h2 class="text--block">{serviceDetail.altTitle}</h2>
            {/if}
            {#if serviceDetail.linkDemo}
                {#if serviceDetail.linkDemo.includes('http')}
                    <div class="l-hidden">
                        <a
                            href={serviceDetail.linkDemo}
                            class="services-lvl2--url text--eyebrow link--on-hover"
                            target="_blank"
                            rel="noopener">
                            <Icon name="external" />
                            <span>
                                {#if serviceDetail.linkLabel}
                                    {serviceDetail.linkLabel}
                                {:else}
                                    {serviceDetail.linkDemo}
                                {/if}
                            </span>
                        </a>
                        <div class="spacer-2"></div>
                    </div>
                {:else}
                    <div class="l-hidden">
                        <a href={serviceDetail.linkDemo} class="services-lvl2--url text--eyebrow link--on-hover">
                            <span>
                                {#if serviceDetail.linkLabel}
                                    {serviceDetail.linkLabel}
                                {:else}
                                    {serviceDetail.linkDemo}
                                {/if}
                            </span>
                        </a>
                        <div class="spacer-2"></div>
                    </div>
                {/if}
            {/if}
            <div class="wysiwyg">
                {serviceDetail.description}
            </div>
            {#if serviceDetail.imageSrc}
                <img
                    class={`services-lvl2__image ${serviceDetail.type === 'mockup' ? 'services-lvl2__image--web' : ''} ${serviceDetail.type === 'illustration' ? 'services-lvl2__image--illustration' : ''}`}
                    src={serviceDetail.imageSrc}
                    alt={serviceDetail.altTitle || serviceDetail.title} />
            {/if}
        </div>
    {/each}
{/if}
