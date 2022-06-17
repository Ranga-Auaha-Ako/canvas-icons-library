<script async lang="ts">
	interface Icon {
		id: string;
		url: string;
		title?: string;
		width: number;
		height: number;
		tnp_id: string;
		tags?: string[];
		term?: string;
		collections?: string[];
	}

	interface Category {
		name: string;
		icons: Icon[];
	}

	interface foundCategory {
		category: string;
		icons: string[];
	}

	interface iconMeta {
		meta: Category[];
		files: foundCategory[];
	}

	// import { dev } from '$app/env';
	import { base, assets } from '$app/paths';

	const awaitIconsDB = (async () => {
		// const iconMetaData = await fetch(`${base}/meta.json`).then((res) => res.json()).catch( e => (<iconMeta> {meta: [], files: []}));
		const iconMetaData = await fetch(`${base}/meta.json`).then(res => {
			if (!res.ok) {
				throw new Error(res.statusText)
			}
			return res.json() as Promise<iconMeta>
		})


		const iconDiffs = await Promise.all(
			iconMetaData.meta.map(async (metaCategory) => {
				// Loop through the meta categories and find differences between it and the actual files
				const foundCategory = iconMetaData.files.find(
					({ category }) => category === metaCategory.name
				);
				if (!foundCategory) return { newIcons: [], removedIcons: metaCategory.icons };
				const newIcons = foundCategory.icons.filter((iconUrl) => {
					return !metaCategory.icons.find((i) => i.url == iconUrl);
				});
				const removedIcons = metaCategory.icons.filter(({ url }) => {
					return !foundCategory.icons.find((i) => i == url);
				});
				return { newIcons, removedIcons };
			})
		);

		return { iconData: iconMetaData, diffs: iconDiffs };
	})();

	let chosenCategory = 0;
</script>

<h1 class="text-3xl font-bold">Canvas Icons Editor</h1>
<p>
	Welcome to the editor for Canvas Icons. This tool will let you adjust and configure the metadata
	for icons in each category. To begin, select a category:
</p>
{#await awaitIconsDB }
	<p>Loading...</p>
{:then {iconData, diffs}}
	<select bind:value={chosenCategory}>
		{#each iconData.meta as category, index}
			<option value={index}>
				{category.name}
			</option>
		{/each}
	</select>
	<h2 class="text-xl font-bold mt-3">New Icons found:</h2>
	{#each diffs[chosenCategory].newIcons as newIcons}
		<p>{newIcons}</p>
	{/each}
	<h2 class="text-xl font-bold mt-3">Deleted Icons found:</h2>
	{#each diffs[chosenCategory].removedIcons as newIcons}
		<p>{newIcons}</p>
	{/each}
	<h2 class="text-xl font-bold mt-3">Existing Icons:</h2>
	{#each iconData.meta[chosenCategory].icons as newIcons}
		<p>{newIcons.url}</p>
	{/each}
{/await}
