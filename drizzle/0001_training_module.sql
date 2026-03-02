-- Create training_weeks table
CREATE TABLE IF NOT EXISTS training_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

-- Create training_topics table
CREATE TABLE IF NOT EXISTS training_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

-- Create training_subtopics table
CREATE TABLE IF NOT EXISTS training_subtopics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES training_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

-- Create intern_training_progress table
CREATE TABLE IF NOT EXISTS intern_training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  subtopic_id uuid NOT NULL REFERENCES training_subtopics(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create intern_certificates table
CREATE TABLE IF NOT EXISTS intern_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid NOT NULL UNIQUE REFERENCES interns(id) ON DELETE CASCADE,
  certificate_number text NOT NULL UNIQUE,
  issued_date timestamp DEFAULT now(),
  certificate_url text,
  created_at timestamp DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_training_topics_week_id ON training_topics(week_id);
CREATE INDEX IF NOT EXISTS idx_training_subtopics_topic_id ON training_subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_intern_training_progress_intern_id ON intern_training_progress(intern_id);
CREATE INDEX IF NOT EXISTS idx_intern_training_progress_week_id ON intern_training_progress(week_id);
CREATE INDEX IF NOT EXISTS idx_intern_training_progress_subtopic_id ON intern_training_progress(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_intern_certificates_intern_id ON intern_certificates(intern_id);
