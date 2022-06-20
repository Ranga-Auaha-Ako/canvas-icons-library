<script async lang="ts">
	import { onMount } from 'svelte';
	import { expoInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import type { Icon, Category, foundCategory, iconMeta } from '$lib/icons';
	import { getIconUrl } from '$lib/icons';
	import IconList from '$lib/icons/iconList.svelte';
	import IconForm from '$lib/icons/iconForm.svelte';
	import { nanoid } from 'nanoid';

	import { browser, dev } from '$app/env';
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

	let chosenCategory = 0;
	let chosenIcon: undefined | string;
	$: chosenIconData = iconData?.meta[chosenCategory].icons.find((i) => i.id == chosenIcon);
	$: iconNotDeleted = !iconDiffs[chosenCategory]?.removedIcons.find(
		(i) => i.id == chosenIconData?.id
	);

	const updateIcons = (e: CustomEvent) => {
		const { icons } = e.detail;
	};

	let existingTags = [] as string[];
	let existingCollections = [] as string[];
	const updateTagData = () => {
		existingTags = [
			// Only unique values
			...new Set(
				iconData.meta.reduce(
					(acc, cat) =>
						// Step through categories, reducing each icon to a list of tags and bunching together
						acc.concat(
							cat.icons.reduce((acc, i) => (i.tags ? acc.concat(i.tags) : acc), [] as string[])
						),
					[] as string[]
				)
			)
		];
		// Load list of collections
		existingCollections = [
			// Only unique values
			...new Set(
				iconData.meta.reduce(
					(acc, cat) =>
						// Step through categories, reducing each icon to a list of tags and bunching together
						acc.concat(
							cat.icons.reduce(
								(acc, i) => (i.collections ? acc.concat(i.collections) : acc),
								[] as string[]
							)
						),
					[] as string[]
				)
			)
		];
	};

	const addIcon = (e: CustomEvent) => {
		const icon = e.detail as Icon;
		chosenIcon = icon.id;
		iconData.meta[chosenCategory].icons.push(icon);
		needSave = true;
	};

	let needSave = false;
	if (browser) {
		window.onbeforeunload = function () {
			// https://stackoverflow.com/questions/1299452/how-do-i-stop-a-page-from-unloading-navigating-away-in-js
			if (needSave) {
				return 'You have made changes on this page that you have not yet confirmed. If you navigate away from this page you will lose your unsaved changes';
			}
		};
	}

	const loadData = async () => {
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

		// Parse tag data
		updateTagData();
	};

	const saveData = async () => {
		// const data = iconData.meta[chosenCategory];
		console.log(dev);
		if (dev) {
			// If we are running in dev mode, just save the data to the file. Otherwise, download it
			const res = await fetch(`${base}/meta.json`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(iconData.meta)
			});
			if (res.status == 200) {
				needSave = false;
			}
		}
	};

	onMount(loadData);
</script>

<h1 class="text-3xl font-bold">Canvas Icons Editor</h1>
<p class="mb-3">
	Welcome to the editor for Canvas Icons. This tool will let you adjust and configure the metadata
	for icons in each category. To begin, select a category:
</p>
{#if needSave}
	<div
		transition:slide
		class="my-3 rounded shadow bg-yellow-100 p-5 border-dashed border-2 border-yellow-400"
	>
		<p class="m-0 text-yellow-800">
			⚠️ You have unsaved changes. Please save or discard them before proceeding.<br />
			<b
				>Note: You will need to rebuild before these changes are reflected in <pre
					class="inline-block">/dist/</pre></b
			>
			<span class="btn-group inline float-right">
				<button class="btn" on:click={saveData}>Save</button>
				<button
					class="btn"
					on:click={() => {
						if (confirm('Are you sure you want to discard your changes?')) {
							loadData();
							needSave = false;
						}
					}}>Discard</button
				>
			</span>
		</p>
	</div>
{/if}
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
				} ring-gray-200 ring-1 transition-all text-xs mr-0.5 mb-0.5 py-1 px-2 inline-block cursor-pointer select-none`}
				on:click={() => (chosenCategory = needSave ? chosenCategory : index)}
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
						<IconList icons={iconDiffs[chosenCategory].newIcons} on:addIcon={addIcon} newIcons />
					{/if}
					<!-- {#if iconDiffs[chosenCategory].removedIcons.length}
						<h2 class="text-xl font-bold mt-3">Deleted Icons found:</h2>
						<IconList icons={iconDiffs[chosenCategory].removedIcons} deletedIcons />
					{/if} -->
				{/if}
			</div>
			<h2 class="text-xl font-bold mt-3">Existing Icons:</h2>
			<!--  - Top matching icons -->
			<!-- on:selectIcon -->
			<IconList
				bind:icons={iconData.meta[chosenCategory].icons}
				on:edit={(e) => {needSave = true;}}
				on:addIcon={addIcon}
				bind:chosenIcon
			/>
		</div>
		{#if chosenIcon}
			<div class="icon-editor w-6/12">
				<!-- <h2 class="text-xl font-bold mt-3">Icon Editor:</h2> -->
				{#if chosenIconData && iconNotDeleted}
					<div class="card bg-white iconHeader">
						<div class="icon">
							<img src={getIconUrl(chosenIconData)} alt={chosenIconData.title} />
						</div>
						<IconForm
							icon={chosenIconData}
							{existingCollections}
							{existingTags}
							on:changed={() => {
								needSave = true;
							}}
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style lang="postcss">
</style>
