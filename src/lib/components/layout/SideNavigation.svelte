<script lang="ts">
	import { House, Rows3, Settings } from '@lucide/svelte';
</script>

<nav class="side-navigation">
	<ul>
		<li><a href="/private/dashboard"><House /></a></li>
		<li><a href="/private/orders"><Rows3 /></a></li>
		<li><a href="#services"><Settings /></a></li>
		<!-- <li><a href="#contact">Contact</a></li> -->
	</ul>
</nav>

<style>
	.side-navigation {
		display: flex;
		height: 100%;
		border-right: 1px solid grey;
		padding-left: calc(4vw - 1px);
		padding-right: 40px;
		flex: 0 0 auto;
		position: sticky;
		top: 0;
	}
	.side-navigation ul {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	ul li:not(:last-of-type) {
		margin-bottom: 16px;
	}
</style>
