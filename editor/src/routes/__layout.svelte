<script>
	import '../app.css';
</script>

<div class="wrapper bg-slate-800">
	<div class="app rounded bg-gray-50 drop-shadow px-6 py-5">
		<slot />
	</div>
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: top;
		height: 100vh;
		overflow: auto;
		.app {
			margin-top: 5vh;
			width: 50em;
			max-width: calc(100% - 2em);
		}
	}
</style>
