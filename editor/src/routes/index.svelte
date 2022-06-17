<script async lang="ts">
	import { onMount } from 'svelte';
	import { expoInOut } from 'svelte/easing';
	import type { Icon, Category, foundCategory, iconMeta } from '$lib/icons';
	import { getIconUrl } from '$lib/icons';
	import IconList from '$lib/icons/iconList.svelte';
	import { nanoid } from 'nanoid';

	// import { dev } from '$app/env';
	import { base, assets } from '$app/paths';

	// Custom slide transition
	function expandPanel(node: Element, { delay = 0, duration = 200, easing = expoInOut }) {
		const w = parseFloat(getComputedStyle(node).width);

		return {
			delay,
			duration,
			easing: easing || expoInOut,
			css: (t: number) => `margin-right: ${(1 - t) * w * -1}px; position: relative; width: ${w}px;`
		};
	}

	let iconData: iconMeta;
	let iconDiffs: {
		newIcons: Icon[];
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
				let newIcons = foundCategory.icons
					.filter((iconUrl) => {
						return !metaCategory.icons.find((i) => i.url == iconUrl);
					})
					.map((url) => {
						let tnp_id = '';
						const foundID = url.match(/noun_[\w\d_]+_(\d+)/);
						if (foundID && foundID[1]) {
							tnp_id = foundID[1];
						}
						return <Icon>{
							id: nanoid(),
							width: 48,
							height: 48,
							tnp_id,
							url,
							tags: [],
							collections: []
						};
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
	let chosenIcon: undefined | string;
	$: chosenIconData = iconData?.meta[chosenCategory].icons.find((i) => i.id == chosenIcon);
	$: iconNotDeleted = !iconDiffs[chosenCategory]?.removedIcons.find(
		(i) => i.id == chosenIconData?.id
	);

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
	<!-- Two column layout for list and icon editing panel -->
	<div class="flex">
		<div class="icon-lists flex-grow-0 w-6/12 pr-5">
			<div class="changes">
				{#if iconDiffs[chosenCategory]}
					{#if iconDiffs[chosenCategory].newIcons.length}
						<h2 class="text-xl font-bold mt-3">New Icons found:</h2>
						<IconList icons={iconDiffs[chosenCategory].newIcons} />
					{/if}
					{#if iconDiffs[chosenCategory].removedIcons.length}
						<h2 class="text-xl font-bold mt-3">Deleted Icons found:</h2>
						<IconList icons={iconDiffs[chosenCategory].removedIcons} />
					{/if}
				{/if}
			</div>
			<h2 class="text-xl font-bold mt-3">Existing Icons:</h2>
			<!--  - Top matching icons -->
			<!-- on:selectIcon -->
			<IconList
				bind:icons={iconData.meta[chosenCategory].icons}
				on:edit={updateIcons}
				bind:chosenIcon
			/>
		</div>
		{#if chosenIcon}
			<div class="icon-editor w-6/12">
				<h2 class="text-xl font-bold mt-3">Icon Editor:</h2>
				<h1>Selected Icon</h1>
				{#if chosenIconData && iconNotDeleted}
					<p>Found Icon {chosenIconData}</p>
					<img src={getIconUrl(chosenIconData)} alt="" />
				{/if}
			</div>
		{/if}
	</div>
{/if}
