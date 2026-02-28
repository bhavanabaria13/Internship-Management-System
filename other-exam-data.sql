exams-module
exam_instructions- X
questions--module
exam_attempts---

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  total_marks INT NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL, -- 'A', 'B', 'C', or 'D'
  marks INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  intern_id UUID REFERENCES interns(id),
  started_at TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  status VARCHAR(20) CHECK (
    status IN ('STARTED', 'SUBMITTED', 'TIMEOUT')
  ),
  score INT DEFAULT 0
);
CREATE TABLE interns_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  answer_text TEXT,
  marks_obtained INT DEFAULT 0
);
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID UNIQUE REFERENCES exam_attempts(id),
  total_marks INT,
  obtained_marks INT,
  percentage NUMERIC(5,2),
  grade VARCHAR(10),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE exam_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  instruction TEXT NOT NULL
);