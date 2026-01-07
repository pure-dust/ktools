console.log("css-loader start loading")

KtoolsPluginLoader.addSetting([{ category: "app", name: "style-测试", type: 5, prop: "test" }])

let styleContent = await KtoolsPluginLoader.readFile("style.css")
let style = document.createElement("style")
style.innerHTML = styleContent
if (value === undefined || value === true) {
    document.head.appendChild(style)
}

KtoolsPluginLoader.subscribeConfigChange("app.kl-style_test", ([_target, _key, value]) => {
    if (value && !style.parentNode) {
        document.head.appendChild(style)
    } else {
        style.remove()
    }
})


