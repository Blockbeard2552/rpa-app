<script lang="ts">
	import AuthForm from '$components/forms/AuthForm.svelte';

	let { form } = $props();
	$inspect(form);
</script>

<AuthForm isRegistration={true} {form} />
