import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from './app/lib/config';

const Stack = createNativeStackNavigator();

// ========== HELPER FUNCTIONS (Mirrored from Web) ==========

// Simple UUID generator for mobile
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Parse AI explanation response (mirrors web/lib/api.ts generateExplanation)
const parseExplanation = (data) => {
  // Check for new persona format first
  if (data.persona_title || data.vibe_summary) {
    return {
      persona_title: data.persona_title || "",
      vibe_summary: data.vibe_summary || "",
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      growth_edges: Array.isArray(data.growth_edges) ? data.growth_edges : [],
      how_you_show_up: data.how_you_show_up || "",
      tagline: data.tagline || "",
      // Backward compatibility
      summary: data.vibe_summary || data.summary || "",
      cautions: Array.isArray(data.growth_edges) ? data.growth_edges : (Array.isArray(data.challenges) ? data.challenges : []),
      tone: "Balanced",
    };
  }

  // Fallback to old format parsing
  const strengths = [];
  const cautions = [];

  if (Array.isArray(data.strengths)) strengths.push(...data.strengths);
  if (Array.isArray(data.challenges)) cautions.push(...data.challenges);

  // Parse steps if available (old format)
  if (data.steps && Array.isArray(data.steps)) {
    data.steps.forEach((step) => {
      const stepText = typeof step === "string" ? step : String(step || "");
      if (!stepText || stepText.trim() === "") return;

      const lowerStep = stepText.toLowerCase();
      if (
        lowerStep.includes("challenge") ||
        lowerStep.includes("caution") ||
        lowerStep.includes("watch") ||
        lowerStep.includes("avoid") ||
        lowerStep.includes("growth edge")
      ) {
        const cleanText = stepText.replace(/^(Challenge|Growth Edge):\s*/i, "").trim();
        if (cleanText) cautions.push(cleanText);
      } else {
        const cleanText = stepText.replace(/^Strength:\s*/i, "").trim();
        if (cleanText) strengths.push(cleanText);
      }
    });
  }

  return {
    persona_title: "Personality Profile", // Default title for old format
    tagline: data.summary ? data.summary.slice(0, 50) + "..." : "Your unique personality blueprint",
    how_you_show_up: data.summary || "Analysis complete.",
    strengths: strengths.length > 0 ? strengths : ["Reliability", "Detail-oriented"],
    growth_edges: cautions.length > 0 ? cautions : ["Adaptability"],
    summary: data.summary || "",
  };
};

// Transform assessment result (mirrors web/lib/api.ts submitAssessment)
const transformAssessmentResult = (backendData) => {
  return {
    assessment_id: backendData.assessment_id,
    traits: backendData.traits,
    facets: backendData.facets,
    mbti: backendData.dominant?.mbti_proxy || null,
    has_complete_profile: backendData.has_complete_profile ?? (backendData.dominant?.mbti_proxy !== null),
    traits_with_data: backendData.traits_with_data,
  };
};

// ========== HOME SCREEN ==========
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4f46e5', '#7c3aed']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.homeContent}>
            <Text style={styles.logo}>✨</Text>
            <Text style={[styles.logo, { fontSize: 40, color: '#fff', fontWeight: 'bold' }]}>LifeSync</Text>
            <Text style={styles.tagline}>Unlock your potential</Text>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('QuizIntro')}
            >
              <Text style={styles.cardTitle}>Personality Assessment</Text>
              <Text style={styles.cardDesc}>
                Discover your Big Five traits and get personalized insights in just 5 minutes.
              </Text>
              <Text style={{ color: '#4f46e5', fontWeight: 'bold', marginTop: 10 }}>Start Assessment →</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>v1.0.2</Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ========== INTRO SCREEN ==========
function QuizIntroScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.screenPadding}>
          <Text style={styles.screenTitle}>Personality Assessment</Text>
          <Text style={styles.screenSubtitle}>30 Questions • 5-10 minutes</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              This assessment evaluates your personality across five key dimensions:
            </Text>
            <Text style={styles.dimensionText}>• Openness to Experience</Text>
            <Text style={styles.dimensionText}>• Conscientiousness</Text>
            <Text style={styles.dimensionText}>• Extraversion</Text>
            <Text style={styles.dimensionText}>• Agreeableness</Text>
            <Text style={styles.dimensionText}>• Neuroticism</Text>

            <Text style={styles.noteText}>
              Answer honestly for the most accurate results.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Text style={styles.buttonText}>Begin Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ========== QUIZ SCREEN ==========
function QuizScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      // Mirror web: limit=30, and add cache busting params
      const params = new URLSearchParams({
        limit: '30',
        v: '2024-11-17-v2',
        t: Date.now().toString()
      });

      const response = await fetch(`${API_URL}/v1/questions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();

      const allQuestions = data.questions || data;

      // Mirror web: Shuffle questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

      setQuestions(shuffled);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnswer = (value) => {
    const currentQuestion = questions[currentIndex];

    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    setLoading(true);
    const answersToSubmit = finalAnswers || answers;
    const userId = generateUUID();

    try {
      const payload = {
        user_id: userId,
        responses: answersToSubmit,
        quiz_type: 'quick' // 30-question quiz type
      };

      const response = await fetch(`${API_URL}/v1/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const backendData = await response.json();
      console.log('Assessment Success! ID:', backendData.assessment_id);

      // Transform data to match web structure
      const result = transformAssessmentResult(backendData);

      navigation.navigate('Result', { result });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={fetchQuestions}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.quizContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.questionCounter}>
          Question {currentIndex + 1} of {questions.length}
        </Text>

        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        <View style={styles.answersContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={styles.answerButton}
              onPress={() => handleAnswer(value)}
            >
              <Text style={styles.answerButtonText}>
                {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'][value - 1]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ========== RESULT SCREEN ==========
function ResultScreen({ route, navigation }) {
  const { result } = route.params || {};
  const [explanation, setExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(true);

  useEffect(() => {
    if (result?.assessment_id) {
      fetchExplanation(result.assessment_id);
    }
  }, [result]);

  const fetchExplanation = async (assessmentId) => {
    try {
      const response = await fetch(`${API_URL}/v1/assessments/${assessmentId}/generate_explanation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}) // Empty body as required
      });

      if (!response.ok) {
        console.warn('Explanation generation failed:', response.status);
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      // Use the robust parser from web
      const parsed = parseExplanation(data);
      setExplanation(parsed);
    } catch (err) {
      console.error('Explanation error:', err);
      // Fallback
      setExplanation({
        persona_title: "Personality Profile",
        tagline: "Your unique personality blueprint",
        how_you_show_up: "We couldn't generate your personalized AI insights at this moment, but your trait scores above provide a detailed view of your personality structure.",
        strengths: ["Reliability", "Detail-oriented", "Structured"],
        growth_edges: ["Adaptability", "Spontaneity"]
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (!result) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No results found</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map full trait names to codes for color lookup
  const traitCodeMap = {
    'Openness': 'O',
    'Conscientiousness': 'C',
    'Extraversion': 'E',
    'Agreeableness': 'A',
    'Neuroticism': 'N',
    // Fallbacks
    'O': 'O', 'C': 'C', 'E': 'E', 'A': 'A', 'N': 'N'
  };

  const traits = Object.entries(result.traits || {});

  // Helper to get trait label
  const getTraitLabel = (key) => {
    const map = {
      'O': 'Openness',
      'C': 'Conscientiousness',
      'E': 'Extraversion',
      'A': 'Agreeableness',
      'N': 'Neuroticism'
    };
    // If key is already full name, return it, else map it
    return map[key] || key;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.screenPadding}>
              <Text style={styles.headerTitle}>Your Profile</Text>
              <Text style={styles.headerSubtitle}>Big Five Personality Assessment</Text>

              {/* Persona Card */}
              <View style={styles.glassCard}>
                {loadingExplanation ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#818cf8" />
                    <Text style={styles.loadingText}>Analyzing your personality...</Text>
                  </View>
                ) : explanation ? (
                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.iconCircle}>
                      <Text style={{ fontSize: 32 }}>✨</Text>
                    </View>
                    <Text style={styles.personaTitle}>{explanation.persona_title}</Text>
                    {result.mbti && (
                      <View style={styles.mbtiBadge}>
                        <Text style={styles.mbtiText}>{result.mbti}</Text>
                      </View>
                    )}
                    <Text style={styles.tagline}>"{explanation.tagline}"</Text>
                  </View>
                ) : null}
              </View>

              {/* Trait Scores */}
              <Text style={styles.sectionHeader}>Trait Scores</Text>
              <View style={styles.glassCard}>
                {traits.map(([traitKey, score]) => {
                  const percentage = Math.round(score * 100);
                  // Premium colors for traits
                  const colorMap = {
                    'O': '#ec4899', // Pink
                    'C': '#3b82f6', // Blue
                    'E': '#f97316', // Orange
                    'A': '#10b981', // Emerald
                    'N': '#ef4444'  // Red
                  };

                  // Safe color lookup
                  const code = traitCodeMap[traitKey] || 'O';
                  const baseColor = colorMap[code] || '#667eea';

                  // Ensure colors are valid strings for LinearGradient
                  const gradientColors = [baseColor, baseColor + '80'];

                  return (
                    <View key={traitKey} style={styles.traitRow}>
                      <View style={styles.traitHeader}>
                        <Text style={styles.traitLabel}>{getTraitLabel(traitKey)}</Text>
                        <Text style={styles.traitValue}>{percentage}%</Text>
                      </View>
                      <View style={styles.traitTrack}>
                        <LinearGradient
                          colors={gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.traitFill, { width: `${percentage}%` }]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* AI Insights Sections */}
              {explanation && (
                <>
                  <Text style={styles.sectionHeader}>Insights</Text>

                  {/* How You Show Up */}
                  <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>How You Show Up</Text>
                    <Text style={styles.bodyText}>{explanation.how_you_show_up}</Text>
                  </View>

                  {/* Strengths */}
                  <View style={styles.glassCard}>
                    <Text style={[styles.cardTitle, { color: '#4ade80' }]}>Strengths</Text>
                    {explanation.strengths?.map((strength, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={styles.checkIcon}>✓</Text>
                        <Text style={styles.bodyText}>{strength}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Growth Areas */}
                  <View style={styles.glassCard}>
                    <Text style={[styles.cardTitle, { color: '#facc15' }]}>Growth Edges</Text>
                    {(explanation.growth_edges || explanation.cautions)?.map((edge, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={styles.warningIcon}>⚠</Text>
                        <Text style={styles.bodyText}>{edge}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Debug Info */}
              <View style={{ marginTop: 20, padding: 10, opacity: 0.5 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 10 }}>
                  Assessment ID: {result.assessment_id}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.actionButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ========== MAIN APP ==========
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QuizIntro" component={QuizIntroScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    flex: 1,
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 40,
    fontWeight: '300',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardDesc: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  footer: {
    color: '#fff',
    marginTop: 30,
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
  },
  screenPadding: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 20,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#667eea',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 24,
  },
  dimensionText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4f46e5',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#94a3b8',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  questionCounter: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
    lineHeight: 32,
  },
  answersContainer: {
    marginTop: 10,
  },
  answerButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  answerButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 0,
  },
  // New Premium Result Styles
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 25,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  personaTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  mbtiBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  mbtiText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tagline: {
    fontSize: 16,
    color: '#cbd5e1',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 4,
  },
  traitRow: {
    marginBottom: 16,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  traitLabel: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '500',
  },
  traitValue: {
    color: '#94a3b8',
    fontSize: 14,
  },
  traitTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  traitFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  bodyText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  checkIcon: {
    color: '#4ade80',
    marginRight: 10,
    fontSize: 16,
    marginTop: 2,
  },
  warningIcon: {
    color: '#facc15',
    marginRight: 10,
    fontSize: 16,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
