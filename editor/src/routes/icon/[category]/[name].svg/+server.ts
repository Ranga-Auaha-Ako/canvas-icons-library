import fs from 'fs';
import appRoot from 'app-root-path'; // NOTE - FINDS THE ROOT OF THE MONOREPO, NOT THE ROOT OF THIS APP

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }: any) {
	const { category, name } = params;
	const dirname = process.env.__PORTABLE__ ? process.env.__PORTABLE__ : `${appRoot}/icons`;
	return new Response(fs.readFileSync(`${dirname}/${category}/${name}.svg`, 'utf8'), {
		headers: { 'content-type': 'image/svg+xml' }
	});
}
