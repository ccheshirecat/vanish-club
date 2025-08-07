export default function AboutPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">About Wrkx Club</h1>
			<div className="prose max-w-none">
				<p className="mb-4">
					Wrkx Club is a secure marketplace platform that prioritizes user privacy and security in digital transactions.
				</p>
				<h2 className="text-2xl font-semibold mt-6 mb-4">Our Mission</h2>
				<p className="mb-4">
					To provide a safe and reliable platform for users to engage in digital commerce while maintaining the highest standards of privacy and security.
				</p>
				<h2 className="text-2xl font-semibold mt-6 mb-4">Features</h2>
				<ul className="list-disc pl-6 mb-4">
					<li>Secure Telegram-based authentication</li>
					<li>Encrypted communications</li>
					<li>Dispute resolution system</li>
					<li>Vendor verification process</li>
				</ul>
			</div>
		</div>
	)
}