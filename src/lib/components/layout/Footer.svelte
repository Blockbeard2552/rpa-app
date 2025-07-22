<script lang="ts">
	import { getUserState } from '$lib/state/user-state.svelte';

	let userContext = getUserState();
	let { hasAdminAccess } = $derived(userContext);
</script>

<footer>
	<div class="footer-content">
		<div class="footer-section">
			<h4>Quick Links</h4>
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/private/dashboard">Dashboard</a></li>
				{#if hasAdminAccess}
					<li><a href="/admin/dashboard">Admin</a></li>
				{/if}
			</ul>
		</div>
		<div class="footer-section">
			<h4>Support</h4>
			<ul>
				<li><a href="/contact">Contact</a></li>
				<li><a href="/help">Help Center</a></li>
			</ul>
		</div>
	</div>
	<div class="footer-bottom">
		<p>&copy; {new Date().getFullYear()} RPA App. All rights reserved.</p>
	</div>
</footer>

<style>
	footer {
		background-color: #1a1a1a;
		color: #ffffff;
		padding: 2rem 0 1rem;
		margin-top: auto;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 4vw;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.footer-section h4 {
		margin-bottom: 1rem;
		color: #ffffff;
	}

	.footer-section h4 {
		font-size: 1rem;
		font-weight: 500;
	}

	.footer-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-section li {
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
	}

	.footer-section a {
		color: #cccccc;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.footer-section a:hover {
		color: #ffffff;
	}

	.footer-bottom {
		border-top: 1px solid #333333;
		margin-top: 2rem;
		padding: 1rem 4vw 0;
		text-align: center;
	}

	.footer-bottom p {
		color: #999999;
		font-size: 0.9rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.footer-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		footer {
			padding: 1.5rem 0 1rem;
		}
	}
</style>
