<script>
	import Button from './Button.svelte';
</script>

<section class="default-margin hero">
	<div class="hero-text">
		<h1>Hero Section</h1>
		<h3>Strapline.</h3>
		<h4 class="mt-l">Additional info.</h4>
		<h4 class="mb-s">what is the CTA</h4>
		<Button href="/register">Create an account.</Button>
	</div>
</section>

<style>
	.hero {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 100px;
		margin-bottom: 80px;
	}
	.hero-text {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
</style>
