-- Create interns table
CREATE TABLE IF NOT EXISTS interns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  work_experience TEXT,
  education TEXT NOT NULL,
  city TEXT NOT NULL,
  github TEXT,
  linkedin TEXT,
  skills TEXT NOT NULL,
  projects TEXT,
  cv_filename TEXT,
  cv_original_name TEXT,
  profile_image TEXT,
  applied_date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create intern_users table
CREATE TABLE IF NOT EXISTS intern_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL UNIQUE REFERENCES interns(id) ON DELETE CASCADE,
  password TEXT NOT NULL,
  is_approved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create weekly_updates table
CREATE TABLE IF NOT EXISTS weekly_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  program_course_name TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  reporting_period TEXT NOT NULL,
  learning_topics TEXT,
  tasks_completed TEXT,
  work_output TEXT,
  github_repo_link TEXT,
  deployed_url TEXT,
  task_completion_status TEXT,
  self_rating INTEGER,
  time_spent TEXT,
  challenges_faced TEXT,
  solutions_attempted TEXT,
  key_learnings TEXT,
  performance_score INTEGER,
  mentor_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES interns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by_intern UUID REFERENCES interns(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP,
  closed_at TIMESTAMP
);

-- Create time_logs table
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  log_type TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in-progress',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  repository_url TEXT,
  deployed_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create session table for express-session
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- ===== TRAINING MODULE TABLES =====

-- Create training_weeks table
CREATE TABLE IF NOT EXISTS training_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create training_topics table
CREATE TABLE IF NOT EXISTS training_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create training_subtopics table
CREATE TABLE IF NOT EXISTS training_subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES training_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create intern_training_progress table
CREATE TABLE IF NOT EXISTS intern_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES training_subtopics(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(intern_id, week_id, subtopic_id)
);

-- Create intern_certificates table
CREATE TABLE IF NOT EXISTS intern_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL UNIQUE REFERENCES interns(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_date TIMESTAMP DEFAULT NOW(),
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== INSERT TRAINING DATA =====

-- Insert Week 1 - Foundations
INSERT INTO training_weeks (week_number, title, description) VALUES
(1, 'Week 1 - Foundations', 'Web3 + React Basics + AI Basics');

-- Get Week 1 ID
WITH week_1 AS (SELECT id FROM training_weeks WHERE week_number = 1)
INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Blockchain fundamentals & Ethereum basics', 'Learn core concepts of blockchain and Ethereum ecosystem' FROM week_1
UNION ALL
SELECT id, 'Solidity syntax and smart contract deployment', 'Master Solidity programming language' FROM week_1
UNION ALL
SELECT id, 'React.js fundamentals (components, props, state)', 'React basics for building UIs' FROM week_1
UNION ALL
SELECT id, 'AI fundamentals and real-world use cases', 'Introduction to AI concepts and applications' FROM week_1;

-- Insert subtopics for Week 1 topics
WITH week_1 AS (SELECT id FROM training_weeks WHERE week_number = 1),
topics AS (
  SELECT ROW_NUMBER() OVER (ORDER BY title) as row_num, id 
  FROM training_topics 
  WHERE week_id = (SELECT id FROM week_1)
  ORDER BY title
)
INSERT INTO training_subtopics (topic_id, title, description)
SELECT id, 'Install Node.js, npm/yarn, VS Code, MetaMask, Trust Wallet, Coinbase Wallet', 'Development environment setup' FROM topics WHERE row_num = 1
UNION ALL
SELECT id, 'Deploy smart contract on Sepolia and remix IDE', 'Smart contract deployment' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'HelloWorld contract', 'Basic contract example' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Counter contract', 'Counter implementation' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Simple Storage', 'Storage contract' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Ownable pattern', 'Access control pattern' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Ether Transfer Smart Contract', 'Transfer implementation' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Ethereum Account & Ownership Example', 'Account management' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Student Registration Contract', 'Registration contract' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Simple Voting Contract', 'Voting system' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Store & update internship task status', 'Task management' FROM topics WHERE row_num = 2
UNION ALL
SELECT id, 'Counter App', 'React counter component' FROM topics WHERE row_num = 3
UNION ALL
SELECT id, 'Input Form App', 'React form component' FROM topics WHERE row_num = 3
UNION ALL
SELECT id, 'Todo List App', 'React todo component' FROM topics WHERE row_num = 3
UNION ALL
SELECT id, 'Machine Learning basics', 'ML fundamentals' FROM topics WHERE row_num = 4
UNION ALL
SELECT id, 'Natural Language Processing', 'NLP concepts' FROM topics WHERE row_num = 4;

-- Insert Week 2
INSERT INTO training_weeks (week_number, title, description) VALUES
(2, 'Week 2 - Smart Contracts & React Advanced', 'Advanced Solidity + React Hooks + Web3 Integration');

WITH week_2 AS (SELECT id FROM training_weeks WHERE week_number = 2)
INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Advanced Solidity patterns', 'Learn advanced contract patterns and best practices' FROM week_2
UNION ALL
SELECT id, 'React Hooks and State Management', 'useEffect, useState, useContext and custom hooks' FROM week_2
UNION ALL
SELECT id, 'Web3.js and ethers.js integration', 'Connect frontend to blockchain' FROM week_2
UNION ALL
SELECT id, 'AI model training and deployment', 'Train and deploy AI models' FROM week_2;

-- Insert Week 3
INSERT INTO training_weeks (week_number, title, description) VALUES
(3, 'Week 3 - DApp Development', 'Full stack DApp development with React and Smart Contracts');

WITH week_3 AS (SELECT id FROM training_weeks WHERE week_number = 3)
INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Building secure smart contracts', 'Security best practices and auditing' FROM week_3
UNION ALL
SELECT id, 'Testing and debugging contracts', 'Using Hardhat and Truffle for testing' FROM week_3
UNION ALL
SELECT id, 'Building complete DApps', 'Full stack DApp development' FROM week_3
UNION ALL
SELECT id, 'AI integration in DApps', 'Combining AI with blockchain' FROM week_3;

-- Insert Week 4
INSERT INTO training_weeks (week_number, title, description) VALUES
(4, 'Week 4 - Deployment and Optimization', 'Production deployment, optimization and best practices');

WITH week_4 AS (SELECT id FROM training_weeks WHERE week_number = 4)
INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Contract optimization and gas efficiency', 'Optimize contract code for production' FROM week_4
UNION ALL
SELECT id, 'Frontend optimization and performance', 'React performance optimization' FROM week_4
UNION ALL
SELECT id, 'Mainnet deployment and monitoring', 'Deploy to production networks' FROM week_4
UNION ALL
SELECT id, 'Advanced AI techniques and applications', 'Advanced AI concepts and real-world applications' FROM week_4;
