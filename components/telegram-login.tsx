"use client"

import { useEffect, useRef, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Cookies from 'js-cookie'

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initDataUnsafe: {
    user?: TelegramWebAppUser;
  };
  initData: string;
  ready: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
    TelegramLoginWidget?: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function TelegramLogin() {
  const { toast } = useToast()
  const { setUser } = useAuth()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram?.WebApp

  const handleAuth = useCallback(async (authData: TelegramUser) => {
    try {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      Cookies.set('token', data.token, { expires: 1 })
      setUser(data.user)
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.user.displayName}!`,
      })
      router.push("/listings")
    } catch (error) {
      console.error("Error during login:", error)
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    }
  }, [router, setUser, toast])

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (isTelegramWebApp && webApp) {
      const initData = webApp.initDataUnsafe
      const user = initData?.user
      if (user) {
        handleAuth({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: Math.floor(Date.now() / 1000),
          hash: webApp.initData
        })
      }
    } else {
      // Browser authentication
      window.TelegramLoginWidget = {
        dataOnauth: handleAuth
      }

      const script = document.createElement("script")
      script.src = "https://telegram.org/js/telegram-widget.js?22"
      script.setAttribute("data-telegram-login", "VanishClubBot")
      script.setAttribute("data-size", "large")
      script.setAttribute("data-radius", "8")
      script.setAttribute("data-request-access", "write")
      script.setAttribute("data-userpic", "false")
      script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)")
      script.async = true

      containerRef.current?.appendChild(script)

      return () => {
        const script = containerRef.current?.querySelector("script")
        if (script && containerRef.current) {
          containerRef.current.removeChild(script)
        }
      }
    }
  }, [isTelegramWebApp, handleAuth])

  if (isTelegramWebApp) {
    return (
        <Button 
        onClick={() => {
          // The auth is handled automatically through initDataUnsafe
        }}
        className="w-full bg-[#54a9eb] hover:bg-[#4095d6] text-white font-medium py-2 px-4 rounded"
        >
        Log in with Telegram
        </Button>

    )
  }

  return <div ref={containerRef} className="telegram-login flex justify-center" />
}


