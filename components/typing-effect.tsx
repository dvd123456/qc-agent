"use client"

import { useState, useEffect } from "react"

interface TypingEffectProps {
  text: string
  speed?: number // milliseconds per character
  onComplete?: () => void
}

export function TypingEffect({ text, speed = 30, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return <span className="whitespace-pre-wrap">{displayedText}</span>
}
