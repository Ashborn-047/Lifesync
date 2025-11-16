/**
 * LifeSync Mobile - Persona Profiles
 * Simplified persona data for mobile (using icon names as strings)
 */

export interface PersonaProfile {
  type: string;
  personaName: string;
  icon: string; // Icon name (for lucide-react-native)
  tagline: string;
  strengths: string[];
  challenges: string[];
  communicationStyle: string;
  decisionStyle: string;
  atBest: string;
  underStress: string;
  voicePreset: string;
}

// Persona data (simplified for mobile)
export const PERSONA_PROFILES: Record<string, PersonaProfile> = {
  INFJ: {
    type: "INFJ",
    personaName: "The Insightful Guide",
    icon: "Eye",
    tagline: "You see what others miss.",
    strengths: ["Empathetic", "Visionary", "Principled"],
    challenges: ["Overthinking", "Idealism"],
    communicationStyle: "Thoughtful, deep, and inspiring. You prefer meaningful conversations.",
    decisionStyle: "Intuitive and value-driven, seeking alignment with your inner compass.",
    atBest: "Guiding others towards their potential, creating harmony.",
    underStress: "Withdrawn, prone to self-doubt, and overwhelmed by conflict.",
    voicePreset: "Warm, reflective, and encouraging."
  },
  INFP: {
    type: "INFP",
    personaName: "The Imaginative Healer",
    icon: "Sparkles",
    tagline: "Your heart is your compass.",
    strengths: ["Creative", "Compassionate", "Authentic"],
    challenges: ["Indecisive", "Sensitive"],
    communicationStyle: "Gentle, expressive, and personal. You share your feelings openly.",
    decisionStyle: "Guided by personal values and a desire for harmony.",
    atBest: "Inspiring creativity and fostering emotional well-being.",
    underStress: "Overly critical of self, withdrawn, and prone to emotional outbursts.",
    voicePreset: "Soft, empathetic, and poetic."
  },
  INTJ: {
    type: "INTJ",
    personaName: "The Strategic Visionary",
    icon: "Target",
    tagline: "Master of the long game.",
    strengths: ["Strategic", "Independent", "Logical"],
    challenges: ["Impatient", "Aloof"],
    communicationStyle: "Direct, precise, and conceptual. You value efficiency and clarity.",
    decisionStyle: "Analytical and future-focused, always seeking the most effective path.",
    atBest: "Designing innovative systems and achieving ambitious goals.",
    underStress: "Overly critical, isolated, and prone to micromanagement.",
    voicePreset: "Authoritative, concise, and intellectual."
  },
  INTP: {
    type: "INTP",
    personaName: "The Curious Architect",
    icon: "Puzzle",
    tagline: "Always questioning, always learning.",
    strengths: ["Analytical", "Innovative", "Objective"],
    challenges: ["Procrastination", "Detached"],
    communicationStyle: "Logical, inquisitive, and sometimes abstract. You enjoy intellectual debate.",
    decisionStyle: "Driven by curiosity and a desire to understand complex systems.",
    atBest: "Solving intricate problems and developing new theories.",
    underStress: "Withdrawn, prone to cynicism, and overwhelmed by practical details.",
    voicePreset: "Neutral, inquisitive, and precise."
  },
  ENFJ: {
    type: "ENFJ",
    personaName: "The Visionary Mentor",
    icon: "Users",
    tagline: "Inspiring growth in others.",
    strengths: ["Charismatic", "Supportive", "Organized"],
    challenges: ["Self-neglect", "Over-committing"],
    communicationStyle: "Engaging, persuasive, and warm. You connect easily with people.",
    decisionStyle: "Harmonious and people-focused, seeking consensus and positive impact.",
    atBest: "Leading and motivating teams, fostering community.",
    underStress: "Overly critical of self, prone to emotional exhaustion, and seeking external validation.",
    voicePreset: "Enthusiastic, encouraging, and articulate."
  },
  ENFP: {
    type: "ENFP",
    personaName: "The Creative Catalyst",
    icon: "Zap",
    tagline: "Ideas spark, possibilities bloom.",
    strengths: ["Enthusiastic", "Spontaneous", "Optimistic"],
    challenges: ["Distractible", "Overthinking"],
    communicationStyle: "Expressive, lively, and inspiring. You love exploring new ideas.",
    decisionStyle: "Impulsive and opportunity-driven, embracing new possibilities.",
    atBest: "Brainstorming innovative solutions and energizing projects.",
    underStress: "Overwhelmed by routine, prone to emotional swings, and feeling uninspired.",
    voicePreset: "Energetic, playful, and imaginative."
  },
  ENTJ: {
    type: "ENTJ",
    personaName: "The Commanding Architect",
    icon: "Crown",
    tagline: "Leading with clear vision.",
    strengths: ["Decisive", "Ambitious", "Efficient"],
    challenges: ["Insensitive", "Controlling"],
    communicationStyle: "Assertive, direct, and strategic. You get straight to the point.",
    decisionStyle: "Logical and results-oriented, always seeking the most effective strategy.",
    atBest: "Building powerful organizations and achieving ambitious goals.",
    underStress: "Impatient, prone to burnout, and overly focused on external achievements.",
    voicePreset: "Confident, direct, and commanding."
  },
  ENTP: {
    type: "ENTP",
    personaName: "The Trailblazing Inventor",
    icon: "Rocket",
    tagline: "Innovation is your playground.",
    strengths: ["Ingenious", "Debater", "Adaptable"],
    challenges: ["Argumentative", "Commitment-phobic"],
    communicationStyle: "Witty, challenging, and intellectual. You enjoy exploring all angles.",
    decisionStyle: "Analytical and experimental, always seeking new ways to innovate.",
    atBest: "Challenging the status quo and inventing novel solutions.",
    underStress: "Bored, restless, and prone to intellectual arrogance.",
    voicePreset: "Sharp, engaging, and provocative."
  },
  ISFJ: {
    type: "ISFJ",
    personaName: "The Quiet Guardian",
    icon: "Shield",
    tagline: "Steadfast in service.",
    strengths: ["Supportive", "Reliable", "Observant"],
    challenges: ["Self-sacrificing", "Resistant to change"],
    communicationStyle: "Gentle, practical, and considerate. You listen more than you speak.",
    decisionStyle: "Practical and duty-bound, prioritizing the needs of others.",
    atBest: "Creating stable environments and caring for loved ones.",
    underStress: "Overwhelmed by criticism, prone to worry, and feeling unappreciated.",
    voicePreset: "Calm, reassuring, and humble."
  },
  ISFP: {
    type: "ISFP",
    personaName: "The Gentle Creator",
    icon: "Palette",
    tagline: "Living life in full color.",
    strengths: ["Artistic", "Spontaneous", "Empathetic"],
    challenges: ["Unpredictable", "Private"],
    communicationStyle: "Quiet, observant, and expressive through action. You value authenticity.",
    decisionStyle: "Personal and experiential, following your heart and impulses.",
    atBest: "Creating beauty and living in the moment.",
    underStress: "Overwhelmed by conflict, prone to escapism, and feeling misunderstood.",
    voicePreset: "Soft, artistic, and authentic."
  },
  ISTJ: {
    type: "ISTJ",
    personaName: "The Grounded Strategist",
    icon: "CheckCircle",
    tagline: "Order brings clarity.",
    strengths: ["Responsible", "Logical", "Thorough"],
    challenges: ["Inflexible", "Overly serious"],
    communicationStyle: "Factual, direct, and reserved. You value accuracy and tradition.",
    decisionStyle: "Practical and systematic, relying on facts and past experience.",
    atBest: "Maintaining order and ensuring tasks are completed efficiently.",
    underStress: "Overwhelmed by chaos, prone to rigidity, and feeling unappreciated.",
    voicePreset: "Formal, precise, and steady."
  },
  ISTP: {
    type: "ISTP",
    personaName: "The Analytical Explorer",
    icon: "Wrench",
    tagline: "Master of the moment.",
    strengths: ["Practical", "Resourceful", "Observant"],
    challenges: ["Impulsive", "Detached"],
    communicationStyle: "Concise, factual, and action-oriented. You prefer doing to talking.",
    decisionStyle: "Logical and adaptable, solving problems as they arise.",
    atBest: "Troubleshooting complex systems and mastering new skills.",
    underStress: "Restless, prone to risk-taking, and feeling constrained.",
    voicePreset: "Calm, direct, and pragmatic."
  },
  ESFJ: {
    type: "ESFJ",
    personaName: "The Warm Connector",
    icon: "Heart",
    tagline: "Bringing people together.",
    strengths: ["Sociable", "Organized", "Caring"],
    challenges: ["People-pleasing", "Sensitive to criticism"],
    communicationStyle: "Friendly, expressive, and supportive. You build strong relationships.",
    decisionStyle: "Consensual and community-focused, prioritizing group harmony.",
    atBest: "Fostering strong communities and ensuring everyone feels included.",
    underStress: "Overwhelmed by conflict, prone to self-blame, and feeling unappreciated.",
    voicePreset: "Friendly, enthusiastic, and reassuring."
  },
  ESFP: {
    type: "ESFP",
    personaName: "The Radiant Performer",
    icon: "Star",
    tagline: "Life is your stage.",
    strengths: ["Spontaneous", "Charming", "Energetic"],
    challenges: ["Impulsive", "Distractible"],
    communicationStyle: "Lively, engaging, and expressive. You love to entertain.",
    decisionStyle: "Experiential and adaptable, living in the moment.",
    atBest: "Bringing joy and excitement to any situation.",
    underStress: "Bored, restless, and feeling uninspired.",
    voicePreset: "Vibrant, playful, and engaging."
  },
  ESTJ: {
    type: "ESTJ",
    personaName: "The Organized Leader",
    icon: "Briefcase",
    tagline: "Leading with a steady hand.",
    strengths: ["Decisive", "Responsible", "Efficient"],
    challenges: ["Inflexible", "Impatient"],
    communicationStyle: "Direct, clear, and authoritative. You value structure and results.",
    decisionStyle: "Logical and duty-bound, ensuring tasks are completed effectively.",
    atBest: "Managing projects and leading teams to success.",
    underStress: "Overwhelmed by inefficiency, prone to rigidity, and feeling disrespected.",
    voicePreset: "Assertive, clear, and confident."
  },
  ESTP: {
    type: "ESTP",
    personaName: "The Energetic Improviser",
    icon: "Activity",
    tagline: "Action speaks louder.",
    strengths: ["Resourceful", "Adaptable", "Bold"],
    challenges: ["Impulsive", "Risk-taking"],
    communicationStyle: "Direct, practical, and engaging. You thrive on immediate action.",
    decisionStyle: "Pragmatic and spontaneous, solving problems as they arise.",
    atBest: "Navigating crises and seizing opportunities.",
    underStress: "Bored, restless, and feeling constrained.",
    voicePreset: "Dynamic, confident, and straightforward."
  },
};

/**
 * Get persona profile by MBTI type
 */
export function getPersona(type: string | null): PersonaProfile | null {
  if (!type) return null;
  return PERSONA_PROFILES[type] ?? null;
}

