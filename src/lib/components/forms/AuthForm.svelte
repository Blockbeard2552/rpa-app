<script lang="ts">
	import Button from '$components/Button.svelte';
	import type { ActionData } from '../../../routes/register/$types';

	interface ComponentProps {
		isRegistration: boolean;
		form: ActionData;
	}

	let { isRegistration, form }: ComponentProps = $props();
</script>

<div class="default-margin auth-container">
	<h1 class="mb-l">{isRegistration ? 'Register' : 'Login'}</h1>
	<form
		class="auth-form"
		method="POST"
		action={isRegistration ? '' : '/login/?/SignInWithPassword'}
	>
		{#if form && form.errors?.length}
			{#each form.errors as error}
				<div class="auth-error"><p>{error}</p></div>
			{/each}
		{/if}
		{#if isRegistration}
			<input type="text" placeholder="name" name="name" value={form?.name || ''} />
		{/if}
		<input type="email" placeholder="email" name="email" value={form?.email || ''} />
		<input type="password" placeholder="password" name="password" value={form?.password || ''} />
		{#if isRegistration}
			<input
				type="password"
				placeholder="confirm password"
				name="confirmPassword"
				value={form?.confirmPassword || ''}
			/>
		{/if}
		<Button type="submit">{isRegistration ? 'Register' : 'Login'}</Button>
	</form>
	<form method="POST" action={isRegistration ? '/login/?/googleLogin' : '?/googleLogin'}>
		<Button type="submit">Log in using Google</Button>
		{#if isRegistration}
			<p class="auth-hint mt-s">Already have an account? <a href="/login">Login</a></p>
		{:else}
			<p class="auth-hint mt-s">Don't have an account? <a href="/register">Register</a></p>
		{/if}
	</form>
</div>

<style>
	.auth-container {
		margin-top: 80px;
	}
	.auth-form {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
	.auth-form input {
		width: 100%;
		margin-bottom: 12px;
	}
	.auth-form input:last-of-type {
		margin-bottom: 30;
	}
	.auth-error {
		background-color: red;
		color: white;
		font-size: 18px;
		border-radius: 12px;
		padding: 12px;
		width: 100%;
		margin-bottom: 8px;
	}
	.auth-error:last-of-type {
		margin-bottom: 16px;
	}

	.auth-hint {
		font-size: 14px;
		color: grey;
	}
</style>
