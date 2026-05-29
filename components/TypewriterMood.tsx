"use client";
/**
 * TypewriterMood — cycles through "vibes" with a typewriter effect.
 * Replaces the static "Order Food For Any Mood" tagline on the hero.
 * Typing speed, pause, and delete speed are all tunable via constants.
 */
import { useState, useEffect } from "react";

/** The moods to cycle through — add/remove as desired */
const MOODS = [
  "Any Mood 🍛",
  "Lazy Sundays 🛋️",
  "Binge Nights 🎬",
  "Dil Se Hunger ❤️",
  "Bestie Hangouts 👯",
  "Post-Gym Cravings 💪",
  "Ghar Wali Feeling 🏠",
  "Monday Blues 😴",
  "Celebration Vibes 🎉",
];

const TYPING_SPEED   = 60;   // ms per character typed
const DELETING_SPEED = 35;   // ms per character deleted
const PAUSE_AFTER    = 1800; // ms to wait before deleting

/**
 * Renders an animated typewriter tagline cycling through moods.
 * Uses a blinking cursor rendered with a CSS animation.
 */
export default function TypewriterMood() {
  const [displayText, setDisplayText] = useState("");
  const [moodIndex, setMoodIndex]     = useState(0);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [isPaused, setIsPaused]       = useState(false);

  useEffect(() => {
    const currentMood = MOODS[moodIndex];

    if (isPaused) {
      // Wait, then start deleting
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, PAUSE_AFTER);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && displayText === currentMood) {
      // Fully typed — pause before deleting
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === "") {
      // Fully deleted — move to next mood
      setIsDeleting(false);
      setMoodIndex((prev) => (prev + 1) % MOODS.length);
      return;
    }

    // Type or delete one character
    const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
    const timer = setTimeout(() => {
      setDisplayText(isDeleting
        ? currentMood.slice(0, displayText.length - 1)
        : currentMood.slice(0, displayText.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, isPaused, moodIndex]);

  return (
    <p className="font-playfair text-xl md:text-2xl text-brand-gold italic mb-6 min-h-[2rem]">
      Order Food For{" "}
      <span className="text-white">
        {displayText}
        {/* Blinking cursor */}
        <span className="inline-block w-0.5 h-5 bg-brand-gold ml-0.5 align-middle animate-blink" />
      </span>
    </p>
  );
}

