"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { TelegramLogin } from "./telegram-login"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const authSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	username: z.string().min(3, "Username must be at least 3 characters").optional(),
	displayName: z.string().min(2, "Display name must be at least 2 characters").optional(),
})

export function AuthForm() {
	const [isLoading, setIsLoading] = useState(false)
	const { toast } = useToast()
	const { setUser } = useAuth()
	const router = useRouter()
	const [activeTab, setActiveTab] = useState("login")

	const form = useForm<z.infer<typeof authSchema>>({
		resolver: zodResolver(authSchema),
		defaultValues: {
			email: "",
			password: "",
			username: "",
			displayName: "",
		},
	})

	async function onSubmit(data: z.infer<typeof authSchema>) {
		setIsLoading(true)
		try {
			const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register"
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || (activeTab === "login" ? "Invalid credentials" : "Registration failed"))
			}

			setUser(result.user)
			toast({
				title: activeTab === "login" ? "Login Successful" : "Registration Successful",
				description: `Welcome${result.user.displayName ? `, ${result.user.displayName}` : ""}!`,
			})
			router.push("/listings")
		} catch (error) {
			console.error("Auth error:", error)
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Something went wrong",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-md p-6 bg-black border border-gray-800">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="register">Register</TabsTrigger>
				</TabsList>
				<TabsContent value="login">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="Enter your email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" placeholder="Enter your password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Loading..." : "Login"}
							</Button>
						</form>
					</Form>
				</TabsContent>
				<TabsContent value="register">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="Enter your email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="Choose a username" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="displayName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Display Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter your display name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" placeholder="Choose a password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Loading..." : "Register"}
							</Button>
						</form>
					</Form>
				</TabsContent>
			</Tabs>
			<div className="mt-6">
				<Separator className="my-4" />
				<div className="text-center text-sm text-gray-500 mb-4">Or continue with</div>
				<div className="flex justify-center">
					<TelegramLogin />
				</div>
			</div>
		</Card>
	)
}