// Force rebuild of Svelte pages by touching `meta.json.ts` if the list of icons has changed
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import esMain from 'es-main';

console.log('Watching icons directory for changes...');

// One-liner for current directory
const watcher = () => {
	chokidar
		.watch(path.resolve(path.resolve(), './icons/**/*'), { ignoreInitial: true })
		.on('all', (event, file) => {
			console.log(`(${event}: ${file}), reloading`);
			//   https://remarkablemark.org/blog/2017/12/17/touch-file-nodejs/
			const time = new Date();
			const filename = path.resolve(path.resolve(), './editor/src/routes/meta.json.ts');
			try {
				fs.utimesSync(filename, time, time);
			} catch (err) {
				fs.closeSync(fs.openSync(filename, 'w'));
			}
		});
};
export default watcher;

if (esMain(import.meta)) {
	watcher();
}
