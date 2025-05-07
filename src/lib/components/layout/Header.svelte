<script lang="ts">
	import icon from '$assets/icon.svg';
	import Button from '$components/Button.svelte';
</script>

<header>
	<a href="/">
		<img src={icon} alt="Go to home" class="logo" />
	</a>
	<nav>
		<ul>
			<li>
				<Button isMenu={true} href="/register">Create Account</Button>
			</li>
			<li>
				<Button isMenu={true} isSecondary={true} href="/login">Login</Button>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 4vw;
	}
	ul {
		display: flex;
		gap: 1rem;
	}
	.logo {
		height: 72px;
	}
</style>
