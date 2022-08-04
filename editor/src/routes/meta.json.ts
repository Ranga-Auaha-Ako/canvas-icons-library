import type { RequestEvent } from '@sveltejs/kit';
import type { Category, Icon } from '$lib/icons';
import glob from 'glob';
import path from 'path';
import fs from 'fs'
// import icons from '../../../dist/meta.json';
import appRoot from 'app-root-path';
import beautify from "json-beautify";
import { parseIcon } from '$lib/icons/iconParse';
const iconsImports = import.meta.globEager('../../../icons/**/meta.json')

export const prerender = true;

const icons = Object.keys(iconsImports).map( catFile => {
	const catData = iconsImports[catFile];
	const catName = path.basename(path.dirname(catFile));
	const CatIcons = catData.icons.map((icon: Icon) => {
		return {...icon, url: path.join(catName,icon.url)};
	})
	return {icons: CatIcons, name: catName}
})

// Get the real folder structure for the icons
const categories = glob.sync("../icons/*/");
const iconsByCategory = categories.map(foundPath => {
	const category = path.basename(foundPath);
	const icons = glob.sync(`${category}/*.svg`, {cwd: "../icons/"});
	return {category, icons};
});

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
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

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function put({request}: RequestEvent) {
	// origin = request.headers.get("Origin");
	const categories = await request.json() as Category[];
	if(!categories || !categories[0].name || !Object.hasOwn(categories[0],"icons")) {return {status: 400}};

	categories.forEach(category => {
		// Generate Path
		const categoryPath = path.resolve(`${appRoot}/../icons/`, category.name,"./meta.json");

		// Strip icon URLs of the category
		category.icons = category.icons.map(icon => {
			icon.url = icon.url.replace(`${category.name}/`, "");
			return icon;
		})
		// Save the files
		// https://github.com/gre/json-beautify/issues/6
		const replacer : any = null;
		fs.writeFileSync(categoryPath, beautify({icons: category.icons}, replacer, "\t", 100), 'utf8');
	})
	return {
		status: 200,
		body: { message: "Successfully saved" }
	}
}