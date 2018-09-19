export default async function importScript(urlOrModuleName) {
	if (urlOrModuleName.includes('/'))
		var url = urlOrModuleName
	else
		var url = `./node_modules/${urlOrModuleName}/index.js`

	var loadPromises = []

	// TODO: check if iframe can be used. might be blocked due to CORS
	var useIframe = true

	if (useIframe) {
		var iframe = createIframe()
		loadPromises.push(promiseEvent(iframe, 'load'))
		document.body.appendChild(iframe)
		var context = iframe.contentWindow
	} else {
		var content = window
	}

	var script = createScript(url)
	loadPromises.push(promiseEvent(script, 'load'))

	context.document.body.appendChild(script)

	var oldProps = Object.getOwnPropertyNames(context)
	var exports = {}
	var module = {exports}
	context.module = module
	context.exports = exports

	await Promise.all(loadPromises)

	delete context.exports
	delete context.module
	if (module.exports !== exports) {
		//return {['default']: module.exports}
		return module.exports
	} else {
		Object.getOwnPropertyNames(context)
			.filter(prop => !oldProps.includes(prop))
			.forEach(prop => {
				exports[prop] = context[prop]
				if (!useIframe) {
					// cleanup
					try {
						delete context[prop]
					} catch(err) {
						context[prop] = undefined
					}
				}
			})

		return exports
	}
}

function promiseEvent(target, event, unsafe = true) {
	return new Promise(resolve => {
		if (unsafe)
			target[`on${event}`] = resolve
		else
			target.addEventListener(event, resolve)
	})
}

function createIframe() {
	var iframe = document.createElement('iframe')
	var {style} = iframe
	style.width = style.height = style.opacity = 0
	style.border = 'none'
	style.visibility = 'hidden'
	return iframe
}

function createScript(src) {
	var script = document.createElement('script')
	script.src = src
	return script
}

/*
function getScriptUrl() {
	if (document.currentScript) {
		return document.currentScript.src
	} else {
		//return import.meta && import.meta.url
	}
}

function buildUrl(arg) {
	var url
	var path
	var relPath
	var name
	if (arg.includes('://')) {
		url = arg
	} else if (arg.startsWith('/')) {
		path = arg
	} else if (arg.startsWith('./')) {
		relPath = arg
	} else if (arg.includes('.') || arg.includes('/')) {
		relPath = './' + arg
	} else if (!arg.includes('/')) {
		name = arg
	}
	if (!url && path)
		url = (new URL(url, location.href)).href
	if (!path && url)
		path = (new URL(url, location.href)).pathname
	if (url || path)
		return {url, path, name}
	if (!relPath && name)
		relPath = `./node_modules/${name}/index.js`
	if (relPath) {
		var scriptUrl = getScriptUrl()
		var urlObject = new URL(relPath, scriptUrl || location.href)
		url = urlObject.href
		path = urlObject.pathname
	}
	return {url, path, name}
}
*/