/**
 * LifeSync Persona Profiles
 * 16 personality personas with Lucide React icons
 */

import * as Icons from "lucide-react";

export interface PersonaProfile {
  type: string;
  personaName: string;
  icon: keyof typeof Icons;
  tagline: string;
  strengths: string[];
  challenges: string[];
  communicationStyle: string;
  decisionStyle: string;
  atBest: string;
  underStress: string;
  voicePreset: string;
}

// Persona data loaded from backend JSON
const personaData = [
  {
    type: "INFJ",
    personaName: "The Insightful Guide",
    icon: "Eye",
    tagline: "You see what others miss.",
    strengths: ["Deep intuition", "Empathetic understanding", "Future-focused vision", "Creative problem-solving"],
    challenges: ["Perfectionism", "Overthinking", "Difficulty setting boundaries"],
    communicationStyle: "Warm, thoughtful, and deeply personal. You connect through meaningful conversations and genuine understanding.",
    decisionStyle: "Intuitive and values-driven. You trust your inner compass and consider long-term impact.",
    atBest: "A visionary mentor who helps others discover their potential and navigate life's complexities with wisdom.",
    underStress: "May become withdrawn, overly critical, or lose sight of practical realities.",
    voicePreset: "Warm, insightful, and encouraging"
  },
  {
    type: "INFP",
    personaName: "The Imaginative Healer",
    icon: "Sparkles",
    tagline: "You create beauty from chaos.",
    strengths: ["Creative expression", "Authentic values", "Empathetic listening", "Flexible thinking"],
    challenges: ["Procrastination", "Sensitivity to criticism", "Difficulty with routine"],
    communicationStyle: "Gentle, expressive, and authentic. You communicate through stories, metaphors, and emotional connection.",
    decisionStyle: "Values-based and open-ended. You explore possibilities and choose paths that align with your authentic self.",
    atBest: "A creative catalyst who brings healing, beauty, and meaning to the world through your unique perspective.",
    underStress: "May become overwhelmed, self-critical, or withdraw from the world.",
    voicePreset: "Gentle, inspiring, and authentic"
  },
  {
    type: "INTJ",
    personaName: "The Strategic Visionary",
    icon: "Target",
    tagline: "You build the future, one plan at a time.",
    strengths: ["Strategic thinking", "Independent judgment", "Long-term planning", "Systematic approach"],
    challenges: ["Impatience with inefficiency", "Difficulty expressing emotions", "Tendency to overthink"],
    communicationStyle: "Direct, precise, and forward-thinking. You communicate ideas clearly and focus on what matters.",
    decisionStyle: "Analytical and strategic. You evaluate options systematically and choose the most efficient path.",
    atBest: "A master strategist who transforms visions into reality through careful planning and execution.",
    underStress: "May become overly critical, isolated, or rigid in thinking.",
    voicePreset: "Clear, confident, and strategic"
  },
  {
    type: "INTP",
    personaName: "The Curious Architect",
    icon: "Puzzle",
    tagline: "You solve puzzles others don't see.",
    strengths: ["Analytical thinking", "Innovative solutions", "Intellectual curiosity", "Logical reasoning"],
    challenges: ["Procrastination", "Difficulty with emotions", "Tendency to overthink"],
    communicationStyle: "Precise, logical, and idea-focused. You enjoy exploring concepts and challenging assumptions.",
    decisionStyle: "Analytical and objective. You weigh evidence, consider alternatives, and choose the most logical option.",
    atBest: "An innovative problem-solver who builds elegant solutions to complex challenges.",
    underStress: "May become paralyzed by analysis, disconnected, or overly critical.",
    voicePreset: "Curious, analytical, and thoughtful"
  },
  {
    type: "ENFJ",
    personaName: "The Visionary Mentor",
    icon: "Users",
    tagline: "You inspire others to become their best.",
    strengths: ["Natural leadership", "Empathetic connection", "Inspiring communication", "People development"],
    challenges: ["Overcommitment", "Difficulty saying no", "Tendency to neglect self-care"],
    communicationStyle: "Warm, inspiring, and people-focused. You naturally motivate and guide others toward their potential.",
    decisionStyle: "Values-driven and people-centered. You consider how decisions affect others and align with your vision.",
    atBest: "A transformative leader who empowers others to grow and achieve their dreams.",
    underStress: "May become controlling, overly emotional, or lose sight of your own needs.",
    voicePreset: "Inspiring, warm, and empowering"
  },
  {
    type: "ENFP",
    personaName: "The Creative Catalyst",
    icon: "Zap",
    tagline: "You turn ideas into energy.",
    strengths: ["Enthusiasm and energy", "Creative problem-solving", "People connection", "Adaptability"],
    challenges: ["Difficulty with routine", "Procrastination", "Tendency to overcommit"],
    communicationStyle: "Energetic, enthusiastic, and engaging. You bring excitement and possibility to every conversation.",
    decisionStyle: "Intuitive and opportunity-focused. You follow your passions and embrace new possibilities.",
    atBest: "A dynamic innovator who sparks creativity and brings fresh perspectives to everything you touch.",
    underStress: "May become scattered, overwhelmed, or lose focus on priorities.",
    voicePreset: "Energetic, enthusiastic, and inspiring"
  },
  {
    type: "ENTJ",
    personaName: "The Commanding Architect",
    icon: "Crown",
    tagline: "You build empires from vision.",
    strengths: ["Natural leadership", "Strategic planning", "Decisive action", "Goal achievement"],
    challenges: ["Impatience", "Difficulty with emotions", "Tendency to be controlling"],
    communicationStyle: "Direct, confident, and goal-oriented. You communicate with authority and clarity.",
    decisionStyle: "Quick, strategic, and results-focused. You make decisions efficiently and move forward decisively.",
    atBest: "A powerful leader who transforms ambitious visions into successful realities.",
    underStress: "May become overly aggressive, controlling, or dismissive of others' feelings.",
    voicePreset: "Confident, authoritative, and decisive"
  },
  {
    type: "ENTP",
    personaName: "The Trailblazing Inventor",
    icon: "Rocket",
    tagline: "You break rules to make new ones.",
    strengths: ["Innovative thinking", "Quick wit", "Debate and discussion", "Adaptability"],
    challenges: ["Difficulty with routine", "Tendency to argue", "Procrastination on details"],
    communicationStyle: "Quick, witty, and intellectually stimulating. You enjoy challenging ideas and exploring possibilities.",
    decisionStyle: "Flexible and opportunity-driven. You explore options, test ideas, and adapt as you go.",
    atBest: "A revolutionary innovator who challenges the status quo and creates breakthrough solutions.",
    underStress: "May become argumentative, scattered, or lose focus on follow-through.",
    voicePreset: "Bold, innovative, and challenging"
  },
  {
    type: "ISFJ",
    personaName: "The Quiet Guardian",
    icon: "Shield",
    tagline: "You protect what matters most.",
    strengths: ["Reliability and loyalty", "Attention to detail", "Caring support", "Practical wisdom"],
    challenges: ["Difficulty saying no", "Tendency to overwork", "Resistance to change"],
    communicationStyle: "Warm, supportive, and detail-oriented. You communicate through actions and thoughtful gestures.",
    decisionStyle: "Careful, tradition-respecting, and people-focused. You consider what's worked before and how it affects others.",
    atBest: "A devoted protector who creates stability and nurtures those around you.",
    underStress: "May become overly critical, rigid, or neglect your own needs.",
    voicePreset: "Warm, reliable, and supportive"
  },
  {
    type: "ISFP",
    personaName: "The Gentle Creator",
    icon: "Palette",
    tagline: "You paint life with beauty.",
    strengths: ["Artistic expression", "Present-moment awareness", "Flexible adaptation", "Authentic values"],
    challenges: ["Difficulty with conflict", "Procrastination", "Tendency to avoid planning"],
    communicationStyle: "Gentle, expressive, and authentic. You communicate through creativity and personal connection.",
    decisionStyle: "Values-based and present-focused. You choose paths that feel authentic and allow for flexibility.",
    atBest: "A creative artist who brings beauty, harmony, and authentic expression to the world.",
    underStress: "May become overly sensitive, withdrawn, or lose motivation.",
    voicePreset: "Gentle, creative, and authentic"
  },
  {
    type: "ISTJ",
    personaName: "The Grounded Strategist",
    icon: "CheckCircle",
    tagline: "You build systems that last.",
    strengths: ["Reliability and consistency", "Attention to detail", "Practical planning", "Strong work ethic"],
    challenges: ["Resistance to change", "Difficulty with abstract ideas", "Tendency to be inflexible"],
    communicationStyle: "Clear, practical, and detail-focused. You communicate facts and proven methods.",
    decisionStyle: "Systematic and tradition-based. You rely on proven methods and careful planning.",
    atBest: "A dependable organizer who creates stability and ensures things work reliably.",
    underStress: "May become overly rigid, critical, or resistant to new ideas.",
    voicePreset: "Clear, reliable, and practical"
  },
  {
    type: "ISTP",
    personaName: "The Analytical Explorer",
    icon: "Wrench",
    tagline: "You fix what's broken, build what's needed.",
    strengths: ["Practical problem-solving", "Hands-on skills", "Independent action", "Crisis management"],
    challenges: ["Difficulty expressing emotions", "Tendency to be impulsive", "Resistance to commitment"],
    communicationStyle: "Direct, practical, and action-focused. You communicate through doing rather than talking.",
    decisionStyle: "Pragmatic and immediate. You assess situations quickly and take efficient action.",
    atBest: "A skilled problem-solver who tackles challenges with practical expertise and independent action.",
    underStress: "May become reckless, disconnected, or overly critical.",
    voicePreset: "Direct, practical, and action-oriented"
  },
  {
    type: "ESFJ",
    personaName: "The Warm Connector",
    icon: "Heart",
    tagline: "You bring people together.",
    strengths: ["People skills", "Organization and planning", "Loyalty and support", "Practical care"],
    challenges: ["Difficulty with conflict", "Tendency to overcommit", "Resistance to change"],
    communicationStyle: "Warm, organized, and people-focused. You communicate with care and attention to others' needs.",
    decisionStyle: "People-centered and tradition-respecting. You consider how decisions affect relationships and group harmony.",
    atBest: "A caring organizer who creates harmony and ensures everyone feels included and supported.",
    underStress: "May become overly controlling, critical, or lose sight of your own needs.",
    voicePreset: "Warm, organized, and caring"
  },
  {
    type: "ESFP",
    personaName: "The Radiant Performer",
    icon: "Star",
    tagline: "You light up every room.",
    strengths: ["Enthusiasm and energy", "People connection", "Present-moment joy", "Spontaneity"],
    challenges: ["Difficulty with planning", "Tendency to avoid conflict", "Resistance to routine"],
    communicationStyle: "Energetic, expressive, and engaging. You communicate with enthusiasm and bring life to every interaction.",
    decisionStyle: "Spontaneous and experience-focused. You choose paths that bring joy and excitement in the moment.",
    atBest: "A vibrant entertainer who brings energy, joy, and connection to everyone around you.",
    underStress: "May become overly dramatic, scattered, or lose focus on responsibilities.",
    voicePreset: "Energetic, joyful, and engaging"
  },
  {
    type: "ESTJ",
    personaName: "The Organized Leader",
    icon: "Briefcase",
    tagline: "You get things done, the right way.",
    strengths: ["Natural leadership", "Organization and planning", "Practical efficiency", "Strong work ethic"],
    challenges: ["Impatience", "Difficulty with emotions", "Tendency to be inflexible"],
    communicationStyle: "Direct, organized, and results-focused. You communicate with clarity and authority.",
    decisionStyle: "Quick, practical, and tradition-based. You make efficient decisions and expect others to follow through.",
    atBest: "A capable leader who creates order, efficiency, and reliable systems.",
    underStress: "May become overly controlling, critical, or dismissive of others' feelings.",
    voicePreset: "Confident, organized, and efficient"
  },
  {
    type: "ESTP",
    personaName: "The Energetic Improviser",
    icon: "Activity",
    tagline: "You live in the moment, act in the now.",
    strengths: ["Quick action", "Practical problem-solving", "People skills", "Crisis management"],
    challenges: ["Difficulty with planning", "Tendency to be impulsive", "Resistance to routine"],
    communicationStyle: "Direct, energetic, and action-focused. You communicate through doing and immediate response.",
    decisionStyle: "Quick, practical, and immediate. You assess situations instantly and take decisive action.",
    atBest: "A dynamic problem-solver who thrives in action and brings practical solutions to immediate challenges.",
    underStress: "May become reckless, impulsive, or lose sight of long-term consequences.",
    voicePreset: "Energetic, direct, and action-focused"
  }
];

// Create the personas record with icon components
export const PERSONA_PROFILES: Record<string, PersonaProfile> = {};

// Initialize personas with icon validation
personaData.forEach((persona) => {
  const IconComponent = Icons[persona.icon as keyof typeof Icons];
  if (!IconComponent) {
    console.warn(`Icon "${persona.icon}" not found in lucide-react, using default`);
  }
  
  PERSONA_PROFILES[persona.type] = {
    type: persona.type,
    personaName: persona.personaName,
    icon: persona.icon as keyof typeof Icons,
    tagline: persona.tagline,
    strengths: persona.strengths,
    challenges: persona.challenges,
    communicationStyle: persona.communicationStyle,
    decisionStyle: persona.decisionStyle,
    atBest: persona.atBest,
    underStress: persona.underStress,
    voicePreset: persona.voicePreset,
  };
});

// Export icon getter function
export function getPersonaIcon(type: string) {
  const persona = PERSONA_PROFILES[type];
  if (!persona) return null;
  
  const IconComponent = Icons[persona.icon];
  return IconComponent || Icons.Users; // Fallback to Users icon
}

