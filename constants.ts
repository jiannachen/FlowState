import { PersonalityTrait } from "./types";

export const TRAIT_DESCRIPTIONS = {
  [PersonalityTrait.EXECUTOR]: "You love checking boxes. We'll give you clear, structured lists.",
  [PersonalityTrait.INFLUENCER]: "You think by talking. We'll schedule outreach and verbal processing.",
  [PersonalityTrait.RELATIONSHIP]: "You care about people. We'll frame tasks around helping others.",
  [PersonalityTrait.STRATEGIC]: "You need data. We'll start with research before action."
};

export const INITIAL_GREETINGS = [
  "How are you feeling today?",
  "What's on your mind?",
  "Let's untangle that anxiety."
];
