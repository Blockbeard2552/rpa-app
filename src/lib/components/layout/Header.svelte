<script lang="ts">
	import icon from '$assets/icon.svg';
	import Button from '$components/Button.svelte';
	import { getUserState } from '$components/state/user-state.svelte';

	let userContext = getUserState();
	let { user } = $derived(userContext);
</script>

<header>
	<a href="/">
		<img src={icon} alt="Go to home" class="logo" />
	</a>
	<nav>
		{#if !user}
			<ul>
				<li>
					<Button isMenu={true} href="/register">Create Account</Button>
				</li>
				<li>
					<Button isMenu={true} isSecondary={true} href="/login">Login</Button>
				</li>
			</ul>
		{:else}
			<ul>
				<li>{user.email}</li>
				<li>
					<Button isMenu={true} onclick={() => userContext.logout()}>Logout</Button>
				</li>
			</ul>
		{/if}
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
		align-items: center;
		gap: 1rem;
	}
	.logo {
		height: 72px;
	}
</style>
