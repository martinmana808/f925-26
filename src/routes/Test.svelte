<script>
    import Layout from '../components/layout/Layout.svelte'
    import { onMount, onDestroy } from 'svelte'
    onMount(() => {
        document.body.classList.add('template--home')
    })
    onDestroy(() => {
        document.body.classList.remove('template--home')
    })
</script>

<Layout>
    
<div class="full-modal">
    <a href="/" >This is too cool for school. Im old.<br><b class="c2">Take me back</b> to the past!</a>
        <div class="full-modal__content">
            <div class="full-modal__close">
            </div>
            <div class="full-modal__body">
                <iframe
                    src="https://www.chatbase.co/chatbot-iframe/F8JdI07-bdTtxhbwhI0RK"
                    width="100%"
                    style="height: 100%; min-height: 700px"
                    frameborder="0"
                    title="Chatbase"
                    ></iframe>
            </div>
        </div>
    </div>
    
</Layout>
