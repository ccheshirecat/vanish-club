import { AuthForm } from "@/components/auth-form"

export default function AuthPage() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">Welcome to Wrkx Club</h1>
					<p className="text-gray-400">Sign in to access the marketplace</p>
				</div>
				<AuthForm />
			</div>
		</div>
	)
}