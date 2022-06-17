<script async lang="ts">
	import { onMount } from 'svelte';
	import type { Icon, Category, foundCategory, iconMeta } from '$lib/icons';
	import IconList from '$lib/icons/iconList.svelte';

	// import { dev } from '$app/env';
	import { base, assets } from '$app/paths';

	let iconData: iconMeta;
	let iconDiffs: {
		newIcons: string[];
		removedIcons: Icon[];
	}[] = [];
	let loading = true;

	onMount(async () => {
		iconData = await fetch(`${base}/meta.json`).then((res) => {
			if (!res.ok) {
				throw new Error(res.statusText);
			}
			return res.json() as Promise<iconMeta>;
		});

		iconDiffs = await Promise.all(
			iconData.meta.map(async (metaCategory) => {
				// Loop through the meta categories and find differences between it and the actual files
				const foundCategory = iconData.files.find(({ category }) => category === metaCategory.name);
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
		loading = false;
	});

	let chosenCategory = 0;

	let unsaved = false;
	const updateIcons = (e: CustomEvent) => {
		const { icons } = e.detail;
	};
</script>

<h1 class="text-3xl font-bold">Canvas Icons Editor</h1>
<p class="mb-3">
	Welcome to the editor for Canvas Icons. This tool will let you adjust and configure the metadata
	for icons in each category. To begin, select a category:
</p>
{#if loading}
	<p>Loading...</p>
{:else}
	<div class="select-category flex flex-wrap">
		{#each iconData.meta as category, index}
			<button
				class={`rounded ${
					chosenCategory == index
						? 'bg-green-300 hover:bg-green-400'
						: 'bg-gray-100 hover:bg-gray-300'
				} border border-gray-200 transition-all text-xs mr-0.5 mb-0.5 py-1 px-2 inline-block cursor-pointer select-none`}
				on:click={() => (chosenCategory = unsaved ? chosenCategory : index)}
			>
				{category.name}
			</button>
		{/each}
	</div>
	<div class="changes">
		{#if iconDiffs[chosenCategory]}
			{#if iconDiffs[chosenCategory].newIcons.length}
				<h2 class="text-xl font-bold mt-3">New Icons found:</h2>
				{#each iconDiffs[chosenCategory].newIcons as icon}
					<p>{icon}</p>
				{/each}
			{/if}
			{#if iconDiffs[chosenCategory].removedIcons.length}
				<h2 class="text-xl font-bold mt-3">Deleted Icons found:</h2>
				{#each iconDiffs[chosenCategory].removedIcons as icon}
					<p>{icon.url}</p>
				{/each}
			{/if}
		{/if}
	</div>
	<h2 class="text-xl font-bold mt-3">Existing Icons:</h2>
	<!--  - Top matching icons -->
	<!-- on:selectIcon -->
	<IconList bind:icons={iconData.meta[chosenCategory].icons} on:edit={updateIcons} />
{/if}
