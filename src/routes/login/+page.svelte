<script lang="ts">
	import AuthForm from '$components/forms/AuthForm.svelte';

	let { form } = $props();
</script>

<AuthForm isRegistration={false} {form} />
