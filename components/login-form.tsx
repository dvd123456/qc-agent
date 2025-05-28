"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login delay
    setTimeout(() => {
      if (email && password) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Please enter email and password.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleSkipLogin = () => {
    router.push("/dashboard")
  }

  return (
    <Card className="glass-effect">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gradient">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your QC projects</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="demo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-primary/20 focus:border-primary"
            />
          </div>
          <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
            UI Demo Mode - Any credentials work
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full btn-gradient text-white" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleSkipLogin}>
            Skip Login (Demo Mode)
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
