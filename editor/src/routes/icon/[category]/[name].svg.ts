import fs from 'fs'
import appRoot from 'app-root-path';

/** @type {import('./__types/items').RequestHandler} */
export async function get({params}: any) {
  const {category, name} = params;
    return {
        headers: { 'content-type': 'image/svg+xml' },
        body: fs.readFileSync(`${appRoot}/../icons/${category}/${name}.svg`, 'utf8') 
    }
  }
  