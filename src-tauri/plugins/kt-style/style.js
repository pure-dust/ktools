KtoolsPluginLoader.onRender(() => {
    KtoolsPluginLoader.readFile("style.css").then(css => {
        let style = document.createElement("style")
        style.innerHTML = css
        document.head.appendChild(style)
    })
})