<script lang="ts">
	import type { Icon } from '$lib/icons';
	import { flip } from 'svelte/animate';
	import { getIconUrl } from '$lib/icons';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';

	export let icons: Icon[];

	let editIcon: string | null = null;

	// Handle movement of Drag&Drop icons, animation
	const flipDurationMs = 300;

	const handleSort = (e: CustomEvent) => {
		console.log('Dragging...');
		console.log(e);
		icons = e.detail.items;
	};

	const removeIcon = (i: number | boolean = false, id: string | boolean = false) => {
		if (id) {
			icons = icons.filter((e, idx) => id !== e.id);
		} else {
			icons = icons.filter((e, idx) => i !== idx);
		}
	};
</script>

<div class="iconList">
	<div
		class="icons grid grid-cols-4 sm:grid-cols-8"
		use:dndzone={{ items: icons, flipDurationMs }}
		on:consider={handleSort}
		on:finalize={handleSort}
	>
		{#each icons as icon, i (icon.id)}
			<div
				class="icon relative p-0.5 m-1 transition-all duration-200 rounded bg-grey-100 hover:scale-110 hover:opacity-50"
				class:editing={editIcon == icon.id}
				animate:flip={{ duration: flipDurationMs }}
				on:click={(e) => (editIcon = editIcon == icon.id ? null : icon.id)}
				title={icon.term}
			>
				{#if editIcon == icon.id}
					<div class="editTools">
						<div role="button" class="delete" on:click={(_) => removeIcon(i)}>Delete</div>
						<!-- <div role="button" class="clone" on:click={(_) => cloneIcon(i)}>Clone</div> -->
					</div>
				{/if}
				<img src={getIconUrl(icon)} alt={icon.title} />
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.icon {
		&.editing {
			box-shadow: 0px 0 1px 3px #4caf50;
			&:hover {
				opacity: 1;
				transform: unset;
				box-shadow: 0px 0 1px 3px #4caf50aa;
			}
		}
		.editTools {
			position: absolute;
			bottom: 100%;
			left: 50%;
			transform: translateX(-50%);
			transition: 0.33s ease transform;
			overflow: hidden;
			border-radius: 3rem;
			margin-bottom: 0.5rem;
			background: white;
			outline: 2px solid white;
			border: 2px solid #4caf50;
			display: flex;
			cursor: default;
			font-size: 0.7rem;
			font-weight: bold;
			color: black;
			z-index: 15;
			&:hover {
				transform: translateX(-50%) scale(1.1);
			}
			.delete,
			.clone {
				cursor: pointer;
				padding: 0.5rem;
				&.delete:hover {
					background-color: #f443361e;
				}
				&.clone:hover {
					background-color: #4caf4f1e;
				}
			}
		}
	}
</style>
