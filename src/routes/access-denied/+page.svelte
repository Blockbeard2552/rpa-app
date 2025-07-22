<script lang="ts">
	import { Shield, ArrowLeft } from '@lucide/svelte';
	import Button from '$components/Button.svelte';
</script>

<div class="access-denied-container">
	<div class="access-denied-content">
		<div class="icon-container">
			<Shield size={80} color="#ef4444" />
		</div>

		<h1>Access Denied</h1>
		<p class="message">
			You don't have the necessary permissions to access this area. Only users with admin or
			moderator roles can access the admin panel.
		</p>

		<div class="actions">
			<Button href="/private/dashboard">
				<ArrowLeft size={16} />
				Back to Dashboard
			</Button>
			<Button href="/" isSecondary={true}>Go Home</Button>
		</div>

		<div class="help-text">
			<p>
				If you believe you should have access to this area, please contact your system
				administrator.
			</p>
		</div>
	</div>
</div>

<style>
	.access-denied-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		padding: 2rem;
	}

	.access-denied-content {
		background: white;
		border-radius: 1rem;
		padding: 3rem;
		box-shadow:
			0 10px 25px -5px rgb(0 0 0 / 0.1),
			0 4px 6px -2px rgb(0 0 0 / 0.05);
		text-align: center;
		max-width: 500px;
		width: 100%;
	}

	.icon-container {
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 1rem 0;
	}

	.message {
		font-size: 1.125rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0 0 2.5rem 0;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.help-text {
		padding-top: 2rem;
		border-top: 1px solid #e2e8f0;
	}

	.help-text p {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.access-denied-container {
			padding: 1rem;
		}

		.access-denied-content {
			padding: 2rem;
		}

		h1 {
			font-size: 2rem;
		}

		.message {
			font-size: 1rem;
		}

		.actions {
			flex-direction: column;
			align-items: center;
		}

		.actions :global(a) {
			width: 100%;
			max-width: 200px;
		}
	}
</style>
