import importScript from './module-loader.mjs'
var jw, removeDiacritics
var ready = (async () => {
	jw = await importScript('jaro-winkler')
	removeDiacritics = (await importScript('diacritics')).remove
})()


ready.then(() => {
	console.log('app is ready, node_modules imported')
})