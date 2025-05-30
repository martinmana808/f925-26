<script>
    export let lvl2pages = []
    export let activeTab
    export let setActiveTab
    function slugify(title) {
        return title.toLowerCase().replace(/\s+/g, '-')
    }
</script>

<ul class="services-nav--lvl2 text--subheadingSm mb-0 list-reset">
    {#if lvl2pages.length > 0}
        {#each lvl2pages as lvl2page}
            <li>
                <a
                    href="#services-lvl2--{slugify(lvl2page.title)}"
                    class={activeTab === 'services-lvl2--' + slugify(lvl2page.title)
                        ? 'active'
                        : ''}
                    on:click|preventDefault={() =>
                        setActiveTab('services-lvl2--' + slugify(lvl2page.title))}>
                    {lvl2page.title}
                </a>
            </li>
        {/each}
    {/if}
</ul>
