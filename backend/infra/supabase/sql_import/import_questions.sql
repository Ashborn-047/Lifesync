-- =====================================================
-- LifeSync Personality Engine - Database Setup Script
-- =====================================================
-- This script will:
-- 1. Create all 4 tables
-- 2. Import 180 questions from the question bank
-- 3. Validate row counts
-- =====================================================

-- =====================================================
-- STEP 1: CREATE TABLES
-- =====================================================

-- Create table for personality questions
CREATE TABLE IF NOT EXISTS personality_questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    trait TEXT NOT NULL,
    facet TEXT NOT NULL,
    reverse BOOLEAN DEFAULT FALSE
);

-- Table for assessments
CREATE TABLE IF NOT EXISTS personality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    quiz_type TEXT NOT NULL,
    raw_scores JSONB,
    facet_scores JSONB,
    trait_scores JSONB,
    mbti_code TEXT
);

-- Table for storing responses
CREATE TABLE IF NOT EXISTS personality_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES personality_assessments(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES personality_questions(id),
    value INTEGER CHECK (value BETWEEN 1 AND 5)
);

-- Table for storing LLM explanations
CREATE TABLE IF NOT EXISTS llm_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES personality_assessments(id) ON DELETE CASCADE,
    explanation TEXT,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 2: IMPORT 180 QUESTIONS
-- =====================================================

-- Clear existing questions and related data (if any)
-- Using CASCADE to also clear dependent tables (responses)
TRUNCATE TABLE personality_questions CASCADE;

-- Insert all 180 questions
INSERT INTO personality_questions (id, text, trait, facet, reverse) VALUES
('Q001', 'I often imagine creative scenarios in my mind', 'O', 'O1', FALSE),
('Q002', 'I rarely daydream about unlikely possibilities', 'O', 'O1', TRUE),
('Q003', 'I enjoy thinking about imaginative ideas', 'O', 'O1', FALSE),
('Q004', 'I prefer to focus on reality rather than imagination', 'O', 'O1', TRUE),
('Q005', 'I like creating mental pictures of new situations', 'O', 'O1', FALSE),
('Q006', 'I find daydreaming to be pointless', 'O', 'O1', TRUE),
('Q007', 'I appreciate beauty in art and nature', 'O', 'O2', FALSE),
('Q008', 'I don''t understand why people care about art', 'O', 'O2', TRUE),
('Q009', 'I notice aesthetic details that others miss', 'O', 'O2', FALSE),
('Q010', 'I rarely pay attention to visual design', 'O', 'O2', TRUE),
('Q011', 'I enjoy spending time in beautiful places', 'O', 'O2', FALSE),
('Q012', 'Artistic experiences don''t move me emotionally', 'O', 'O2', TRUE),
('Q013', 'I enjoy exploring my own emotions deeply', 'O', 'O3', FALSE),
('Q014', 'I don''t spend much time analyzing my feelings', 'O', 'O3', TRUE),
('Q015', 'I experience emotions more intensely than most', 'O', 'O3', FALSE),
('Q016', 'I prefer to keep emotions simple and practical', 'O', 'O3', TRUE),
('Q017', 'I value emotional depth in conversations', 'O', 'O3', FALSE),
('Q018', 'I rarely get caught up in emotional moments', 'O', 'O3', TRUE),
('Q019', 'I like trying new foods and experiences', 'O', 'O4', FALSE),
('Q020', 'I prefer sticking to familiar routines', 'O', 'O4', TRUE),
('Q021', 'I actively seek out novel activities', 'O', 'O4', FALSE),
('Q022', 'I avoid trying things that are unfamiliar', 'O', 'O4', TRUE),
('Q023', 'I enjoy traveling to places I''ve never been', 'O', 'O4', FALSE),
('Q024', 'I find comfort in doing the same things regularly', 'O', 'O4', TRUE),
('Q025', 'I enjoy learning new concepts just for curiosity', 'O', 'O5', FALSE),
('Q026', 'I don''t see the point in learning impractical ideas', 'O', 'O5', TRUE),
('Q027', 'I like discussing philosophical questions', 'O', 'O5', FALSE),
('Q028', 'I prefer practical topics over abstract theories', 'O', 'O5', TRUE),
('Q029', 'I enjoy solving complex mental puzzles', 'O', 'O5', FALSE),
('Q030', 'I find theoretical discussions boring', 'O', 'O5', TRUE),
('Q031', 'I question my personal values and beliefs', 'O', 'O6', FALSE),
('Q032', 'I rarely reconsider my core beliefs', 'O', 'O6', TRUE),
('Q033', 'I''m open to changing my opinions with new evidence', 'O', 'O6', FALSE),
('Q034', 'I stick to traditional values most of the time', 'O', 'O6', TRUE),
('Q035', 'I enjoy debating different viewpoints on ethics', 'O', 'O6', FALSE),
('Q036', 'I prefer not to question established norms', 'O', 'O6', TRUE),
('Q037', 'I feel confident in my ability to handle tasks', 'C', 'C1', FALSE),
('Q038', 'I often doubt whether I can complete things well', 'C', 'C1', TRUE),
('Q039', 'I trust my skills when facing challenges', 'C', 'C1', FALSE),
('Q040', 'I worry that I''m not capable enough', 'C', 'C1', TRUE),
('Q041', 'I believe I can learn what I need to succeed', 'C', 'C1', FALSE),
('Q042', 'I feel unprepared for most responsibilities', 'C', 'C1', TRUE),
('Q043', 'I keep my space organized and tidy', 'C', 'C2', FALSE),
('Q044', 'I often leave things messy and scattered', 'C', 'C2', TRUE),
('Q045', 'I enjoy having everything in its proper place', 'C', 'C2', FALSE),
('Q046', 'I don''t mind if my surroundings are disorganized', 'C', 'C2', TRUE),
('Q047', 'I make sure my belongings are well-arranged', 'C', 'C2', FALSE),
('Q048', 'I rarely organize my personal space', 'C', 'C2', TRUE),
('Q049', 'I take my responsibilities very seriously', 'C', 'C3', FALSE),
('Q050', 'I sometimes skip obligations when inconvenient', 'C', 'C3', TRUE),
('Q051', 'I always try to do what I''ve promised', 'C', 'C3', FALSE),
('Q052', 'I don''t feel too bad about breaking commitments', 'C', 'C3', TRUE),
('Q053', 'I follow through on my obligations consistently', 'C', 'C3', FALSE),
('Q054', 'I often let responsibilities slide if I''m busy', 'C', 'C3', TRUE),
('Q055', 'I set ambitious goals and work hard to achieve them', 'C', 'C4', FALSE),
('Q056', 'I don''t push myself to accomplish more than necessary', 'C', 'C4', TRUE),
('Q057', 'I''m motivated to excel in what I do', 'C', 'C4', FALSE),
('Q058', 'I''m satisfied with doing just enough to get by', 'C', 'C4', TRUE),
('Q059', 'I strive to be the best at important tasks', 'C', 'C4', FALSE),
('Q060', 'I rarely aim for outstanding performance', 'C', 'C4', TRUE),
('Q061', 'I stick to my plans even when it''s difficult', 'C', 'C5', FALSE),
('Q062', 'I easily get distracted from what I''m working on', 'C', 'C5', TRUE),
('Q063', 'I maintain focus until I finish a task', 'C', 'C5', FALSE),
('Q064', 'I give up on tasks when they become tedious', 'C', 'C5', TRUE),
('Q065', 'I push through obstacles to complete my work', 'C', 'C5', FALSE),
('Q066', 'I procrastinate more than I should', 'C', 'C5', TRUE),
('Q067', 'I think carefully before making important decisions', 'C', 'C6', FALSE),
('Q068', 'I often act without thinking things through', 'C', 'C6', TRUE),
('Q069', 'I consider consequences before taking action', 'C', 'C6', FALSE),
('Q070', 'I tend to rush into things impulsively', 'C', 'C6', TRUE),
('Q071', 'I take time to plan before starting something', 'C', 'C6', FALSE),
('Q072', 'I make hasty decisions that I later regret', 'C', 'C6', TRUE),
('Q073', 'I find it easy to connect with new people', 'E', 'E1', FALSE),
('Q074', 'I have trouble warming up to others quickly', 'E', 'E1', TRUE),
('Q075', 'I make others feel comfortable around me', 'E', 'E1', FALSE),
('Q076', 'I tend to keep a distance in relationships', 'E', 'E1', TRUE),
('Q077', 'I''m genuinely interested in other people''s lives', 'E', 'E1', FALSE),
('Q078', 'I prefer not to get too close to people', 'E', 'E1', TRUE),
('Q079', 'I enjoy being around lots of people', 'E', 'E2', FALSE),
('Q080', 'I prefer spending time alone over socializing', 'E', 'E2', TRUE),
('Q081', 'I feel energized at social gatherings', 'E', 'E2', FALSE),
('Q082', 'Large groups make me feel drained', 'E', 'E2', TRUE),
('Q083', 'I like meeting new people regularly', 'E', 'E2', FALSE),
('Q084', 'I avoid social events when I can', 'E', 'E2', TRUE),
('Q085', 'I take charge when a group needs direction', 'E', 'E3', FALSE),
('Q086', 'I let others lead rather than stepping up', 'E', 'E3', TRUE),
('Q087', 'I speak up confidently in group discussions', 'E', 'E3', FALSE),
('Q088', 'I stay quiet even when I have opinions', 'E', 'E3', TRUE),
('Q089', 'I enjoy influencing others'' decisions', 'E', 'E3', FALSE),
('Q090', 'I rarely try to persuade people', 'E', 'E3', TRUE),
('Q091', 'I prefer a fast-paced and busy lifestyle', 'E', 'E4', FALSE),
('Q092', 'I like taking things slowly and calmly', 'E', 'E4', TRUE),
('Q093', 'I enjoy staying active throughout the day', 'E', 'E4', FALSE),
('Q094', 'I prefer a relaxed and quiet daily routine', 'E', 'E4', TRUE),
('Q095', 'I schedule many activities to fill my time', 'E', 'E4', FALSE),
('Q096', 'I avoid over-scheduling myself', 'E', 'E4', TRUE),
('Q097', 'I seek out thrilling and adventurous experiences', 'E', 'E5', FALSE),
('Q098', 'I prefer safe and predictable activities', 'E', 'E5', TRUE),
('Q099', 'I enjoy activities that get my adrenaline going', 'E', 'E5', FALSE),
('Q100', 'I avoid risky or exciting situations', 'E', 'E5', TRUE),
('Q101', 'I look for opportunities to try daring things', 'E', 'E5', FALSE),
('Q102', 'I''m happiest with calm and peaceful activities', 'E', 'E5', TRUE),
('Q103', 'I often feel joyful and enthusiastic', 'E', 'E6', FALSE),
('Q104', 'I rarely experience strong positive emotions', 'E', 'E6', TRUE),
('Q105', 'I laugh easily and enjoy humor', 'E', 'E6', FALSE),
('Q106', 'I tend to stay emotionally neutral most of the time', 'E', 'E6', TRUE),
('Q107', 'I find reasons to be cheerful daily', 'E', 'E6', FALSE),
('Q108', 'I don''t often feel excited about things', 'E', 'E6', TRUE),
('Q109', 'I believe most people have good intentions', 'A', 'A1', FALSE),
('Q110', 'I''m skeptical of others'' motives', 'A', 'A1', TRUE),
('Q111', 'I give people the benefit of the doubt', 'A', 'A1', FALSE),
('Q112', 'I assume people will take advantage if they can', 'A', 'A1', TRUE),
('Q113', 'I trust strangers until proven otherwise', 'A', 'A1', FALSE),
('Q114', 'I''m cautious about trusting new people', 'A', 'A1', TRUE),
('Q115', 'I''m honest even when it''s uncomfortable', 'A', 'A2', FALSE),
('Q116', 'I bend the truth when it''s convenient', 'A', 'A2', TRUE),
('Q117', 'I say what I mean directly and clearly', 'A', 'A2', FALSE),
('Q118', 'I manipulate situations to get what I want', 'A', 'A2', TRUE),
('Q119', 'I value transparency in all interactions', 'A', 'A2', FALSE),
('Q120', 'I often say what people want to hear instead of the truth', 'A', 'A2', TRUE),
('Q121', 'I go out of my way to help others', 'A', 'A3', FALSE),
('Q122', 'I rarely offer help unless asked directly', 'A', 'A3', TRUE),
('Q123', 'I enjoy supporting people even when inconvenient', 'A', 'A3', FALSE),
('Q124', 'I focus on my own needs before others''', 'A', 'A3', TRUE),
('Q125', 'I find fulfillment in being generous', 'A', 'A3', FALSE),
('Q126', 'I avoid getting involved in others'' problems', 'A', 'A3', TRUE),
('Q127', 'I prefer cooperation over competition', 'A', 'A4', FALSE),
('Q128', 'I argue when I disagree with someone', 'A', 'A4', TRUE),
('Q129', 'I try to maintain harmony in groups', 'A', 'A4', FALSE),
('Q130', 'I don''t mind creating conflict to make a point', 'A', 'A4', TRUE),
('Q131', 'I compromise to keep the peace', 'A', 'A4', FALSE),
('Q132', 'I push back strongly when I think I''m right', 'A', 'A4', TRUE),
('Q133', 'I prefer others to receive recognition over me', 'A', 'A5', FALSE),
('Q134', 'I make sure people know about my accomplishments', 'A', 'A5', TRUE),
('Q135', 'I downplay my achievements around others', 'A', 'A5', FALSE),
('Q136', 'I enjoy being the center of attention', 'A', 'A5', TRUE),
('Q137', 'I avoid showing off even when I''ve done well', 'A', 'A5', FALSE),
('Q138', 'I think I''m better than most people at what I do', 'A', 'A5', TRUE),
('Q139', 'I''m deeply moved by others'' difficulties', 'A', 'A6', FALSE),
('Q140', 'I don''t get too emotional about others'' problems', 'A', 'A6', TRUE),
('Q141', 'I feel others'' pain as if it were my own', 'A', 'A6', FALSE),
('Q142', 'I remain detached when people share struggles', 'A', 'A6', TRUE),
('Q143', 'I offer comfort when someone is upset', 'A', 'A6', FALSE),
('Q144', 'I think people are too sensitive about things', 'A', 'A6', TRUE),
('Q145', 'I worry about things that might go wrong', 'N', 'N1', FALSE),
('Q146', 'I rarely feel anxious about the future', 'N', 'N1', TRUE),
('Q147', 'I get nervous before important events', 'N', 'N1', FALSE),
('Q148', 'I stay calm even in uncertain situations', 'N', 'N1', TRUE),
('Q149', 'I often replay concerns in my mind', 'N', 'N1', FALSE),
('Q150', 'I don''t spend time worrying about possibilities', 'N', 'N1', TRUE),
('Q151', 'I get irritated more easily than most people', 'N', 'N2', FALSE),
('Q152', 'I rarely lose my temper with others', 'N', 'N2', TRUE),
('Q153', 'Small annoyances can ruin my mood', 'N', 'N2', FALSE),
('Q154', 'I stay patient even when frustrated', 'N', 'N2', TRUE),
('Q155', 'I hold grudges longer than I should', 'N', 'N2', FALSE),
('Q156', 'I forgive quickly and move on', 'N', 'N2', TRUE),
('Q157', 'I sometimes feel sad without a clear reason', 'N', 'N3', FALSE),
('Q158', 'I rarely experience prolonged low moods', 'N', 'N3', TRUE),
('Q159', 'I have days where everything feels difficult', 'N', 'N3', FALSE),
('Q160', 'I bounce back quickly from disappointments', 'N', 'N3', TRUE),
('Q161', 'I notice my mood drops more than others'' sometimes', 'N', 'N3', FALSE),
('Q162', 'I maintain a positive outlook most days', 'N', 'N3', TRUE),
('Q163', 'I worry about what others think of me', 'N', 'N4', FALSE),
('Q164', 'I don''t care much about others'' opinions', 'N', 'N4', TRUE),
('Q165', 'I replay social interactions in my head', 'N', 'N4', FALSE),
('Q166', 'I forget about social moments quickly', 'N', 'N4', TRUE),
('Q167', 'I feel awkward being the center of attention', 'N', 'N4', FALSE),
('Q168', 'I''m comfortable in the spotlight', 'N', 'N4', TRUE),
('Q169', 'I sometimes act without thinking when upset', 'N', 'N5', FALSE),
('Q170', 'I always think before I act', 'N', 'N5', TRUE),
('Q171', 'I make impulsive choices I later regret', 'N', 'N5', FALSE),
('Q172', 'I carefully consider decisions before making them', 'N', 'N5', TRUE),
('Q173', 'I struggle to resist urges in the moment', 'N', 'N5', FALSE),
('Q174', 'I have good control over my impulses', 'N', 'N5', TRUE),
('Q175', 'I feel overwhelmed by stress more than others', 'N', 'N6', FALSE),
('Q176', 'I handle pressure well without getting flustered', 'N', 'N6', TRUE),
('Q177', 'Small problems can feel like major crises to me', 'N', 'N6', FALSE),
('Q178', 'I keep perspective even during tough times', 'N', 'N6', TRUE),
('Q179', 'I take longer than others to recover from setbacks', 'N', 'N6', FALSE),
('Q180', 'I adapt quickly when things go wrong', 'N', 'N6', TRUE);

-- =====================================================
-- STEP 3: VALIDATION QUERIES
-- =====================================================

-- Check total question count (should be 180)
SELECT 
    'personality_questions' AS table_name,
    COUNT(*) AS row_count,
    CASE 
        WHEN COUNT(*) = 180 THEN '✓ PASS'
        ELSE '✗ FAIL - Expected 180, got ' || COUNT(*)::TEXT
    END AS status
FROM personality_questions;

-- Check questions by trait (should be 36 each)
SELECT 
    trait,
    COUNT(*) AS question_count,
    CASE 
        WHEN COUNT(*) = 36 THEN '✓ PASS'
        ELSE '✗ FAIL - Expected 36, got ' || COUNT(*)::TEXT
    END AS status
FROM personality_questions
GROUP BY trait
ORDER BY trait;

-- Check questions by facet (should be 6 each)
SELECT 
    facet,
    COUNT(*) AS question_count,
    CASE 
        WHEN COUNT(*) = 6 THEN '✓ PASS'
        ELSE '✗ FAIL - Expected 6, got ' || COUNT(*)::TEXT
    END AS status
FROM personality_questions
GROUP BY facet
ORDER BY facet;

-- Check reverse-scored questions (should be ~90, half of 180)
SELECT 
    'Reverse-scored questions' AS metric,
    COUNT(*) AS count,
    CASE 
        WHEN COUNT(*) BETWEEN 85 AND 95 THEN '✓ PASS'
        ELSE '✗ FAIL - Expected ~90, got ' || COUNT(*)::TEXT
    END AS status
FROM personality_questions
WHERE reverse = TRUE;

-- Check all table row counts
SELECT 
    'personality_questions' AS table_name,
    COUNT(*) AS row_count
FROM personality_questions
UNION ALL
SELECT 
    'personality_assessments' AS table_name,
    COUNT(*) AS row_count
FROM personality_assessments
UNION ALL
SELECT 
    'personality_responses' AS table_name,
    COUNT(*) AS row_count
FROM personality_responses
UNION ALL
SELECT 
    'llm_explanations' AS table_name,
    COUNT(*) AS row_count
FROM llm_explanations
ORDER BY table_name;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 
    '=== IMPORT COMPLETE ===' AS message,
    (SELECT COUNT(*) FROM personality_questions) AS questions_imported,
    (SELECT COUNT(DISTINCT trait) FROM personality_questions) AS traits_covered,
    (SELECT COUNT(DISTINCT facet) FROM personality_questions) AS facets_covered;

