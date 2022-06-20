// Force rebuild of Svelte pages by touching `meta.json.ts` if the list of icons has changed
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('node:path');

console.log('Watching icons directory for changes...');

// One-liner for current directory
chokidar
	.watch(path.resolve(__dirname, './icons/**/*'), { ignoreInitial: true })
	.on('all', (event, file) => {
		console.log(`(${event}: ${file}), reloading`);
		//   https://remarkablemark.org/blog/2017/12/17/touch-file-nodejs/
		const time = new Date();
		const filename = path.resolve(__dirname, './editor/src/routes/meta.json.ts');
		try {
			fs.utimesSync(filename, time, time);
		} catch (err) {
			fs.closeSync(fs.openSync(filename, 'w'));
		}
	});
