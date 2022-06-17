<!-- @hmr:keep-all -->
<script lang="ts">
	import type { Icon, Category, foundCategory, iconMeta } from '$lib/icons';
	import Tags from 'svelte-tags-input';

	export let icon: Icon;
	export let existingCollections: string[];
	export let existingTags: string[];
	// export let iconFileList;
</script>

<label class="form-label">
	<span> Icon Title </span>
	<input bind:value={icon.title} placeholder="What should the accessible name of the icon be?" />
</label>
<label class="form-label">
	<span> Icon "Term" (from The Noun Project) </span>
	<input bind:value={icon.term} placeholder="If the icon is from TNP, add the term here" />
</label>
<label class="form-label">
	<span> Icon Path </span>
	<input
		bind:value={icon.url}
		placeholder="Path to SVG file, for example 'Teaching/noun_Network_3565311.svg'"
	/>
</label>
<label class="form-label">
	<span> The Noun Project source ID </span>
	<input bind:value={icon.tnp_id} class:invalid={!/^\d+$|^$/.test(icon.tnp_id)} />
</label>
<label class="form-label" for="iconTags">
	<span> Icon Tags </span>
	<Tags
		id="iconTags"
		addKeys={[9, 188, 13]}
		tags={icon.tags}
		allowPaste={true}
		onlyUnique={true}
		autoComplete={existingTags}
	/>
</label>
<label class="form-label" for="iconCollections">
	<span> The Noun Project "Collections" </span>
	<Tags
		id="iconCollections"
		addKeys={[9, 188, 13]}
		tags={icon.collections}
		allowPaste={true}
		onlyUnique={true}
		autoComplete={existingCollections}
	/>
</label>

<style lang="scss">
	.form-label {
		@apply mb-5 block;
		span {
			@apply block text-gray-700;
		}
		input {
			@apply form-input;
			@apply mt-1 block w-full rounded-md border-gray-300 shadow-sm;
			&:focus {
				@apply border-indigo-300 ring ring-indigo-200 ring-opacity-50;
			}
		}
	}
</style>
