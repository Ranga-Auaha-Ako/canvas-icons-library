import glob from 'glob';
import path from 'path';
import icons from '../../../dist/meta.json';


// Get the real folder structure for the icons
const categories = glob.sync("../icons/*/");
const iconsByCategory = categories.map(foundPath => {
	const category = path.basename(foundPath);
	const icons = glob.sync(`${category}/*.svg`, {cwd: "../icons/"});
	return {category, icons};
});

export async function get() {
	if (icons) {
		return {
			body: {
				meta: icons,
				files: iconsByCategory
			}
		};
	}

	return {
		status: 404
	};
}
