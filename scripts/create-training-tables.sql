-- Create training_weeks table
CREATE TABLE IF NOT EXISTS training_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create training_topics table
CREATE TABLE IF NOT EXISTS training_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create training_subtopics table
CREATE TABLE IF NOT EXISTS training_subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES training_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create intern_training_progress table
CREATE TABLE IF NOT EXISTS intern_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES training_subtopics(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create intern_certificates table
CREATE TABLE IF NOT EXISTS intern_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL UNIQUE REFERENCES interns(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert week 1 data
INSERT INTO training_weeks (week_number, title, description) 
VALUES (1, 'Foundations (Web3 + React Basics + AI Basics)', 'Week 1: Blockchain fundamentals, Ethereum basics, Solidity syntax, React components, and AI fundamentals');

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Blockchain fundamentals & Ethereum basics', 'Learn blockchain concepts and Ethereum network'
FROM training_weeks WHERE week_number = 1;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Solidity syntax and smart contract deployment', 'Master Solidity language and deploy contracts'
FROM training_weeks WHERE week_number = 1;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'React.js fundamentals (components, props, state)', 'Build React components with proper architecture'
FROM training_weeks WHERE week_number = 1;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'AI fundamentals and real-world use cases', 'Understand AI concepts and applications'
FROM training_weeks WHERE week_number = 1;

-- Insert subtopics for Week 1 - Topic 1
INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Blockchain fundamentals & Ethereum basics', 'Core blockchain concepts and Ethereum network architecture'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'Blockchain fundamentals & Ethereum basics'
LIMIT 1;

INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Set up Hardhat, Foundry (optional), Ganache/Anvil', 'Development environment setup for smart contract testing'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'Blockchain fundamentals & Ethereum basics'
LIMIT 1;

-- Insert subtopics for Week 1 - Topic 2
INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Solidity syntax and smart contract deployment', 'Write and deploy smart contracts'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'Solidity syntax and smart contract deployment'
LIMIT 1;

INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Deploy smart contracts (HelloWorld, Counter, Simple Storage, Ownerable pattern, Ether Transfer, Ethereum Account & Ownership, Student Registration Contract, Simple Voting Contract)', 'Practice deploying various contract types'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'Solidity syntax and smart contract deployment'
LIMIT 1;

-- Insert subtopics for Week 1 - Topic 3
INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'React.js fundamentals (components, props, state)', 'Master React component architecture'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'React.js fundamentals (components, props, state)'
LIMIT 1;

INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Build a basic React application (Counter App, Input Form App, Todo List App)', 'Create React applications with state management'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'React.js fundamentals (components, props, state)'
LIMIT 1;

-- Insert subtopics for Week 1 - Topic 4
INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'AI fundamentals and real-world use cases', 'Understand AI concepts and applications'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 1 AND t.title = 'AI fundamentals and real-world use cases'
LIMIT 1;

-- Insert week 2 data
INSERT INTO training_weeks (week_number, title, description) 
VALUES (2, 'Intermediate (Web3 Integration, Advanced React + Smart Contracts)', 'Week 2: Web3 integration, advanced React patterns, and advanced smart contracts');

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Web3 integration with React', 'Connect blockchain to React applications'
FROM training_weeks WHERE week_number = 2;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Advanced React patterns and state management', 'Master advanced React concepts'
FROM training_weeks WHERE week_number = 2;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Advanced smart contracts and DeFi basics', 'Build complex smart contracts'
FROM training_weeks WHERE week_number = 2;

-- Insert subtopics for Week 2
INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Web3 integration with React', 'Connect wallets and interact with smart contracts'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 2 AND t.title = 'Web3 integration with React'
LIMIT 1;

INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Advanced React patterns and state management', 'Use Context API, custom hooks, and performance optimization'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 2 AND t.title = 'Advanced React patterns and state management'
LIMIT 1;

INSERT INTO training_subtopics (topic_id, title, description)
SELECT t.id, 'Advanced smart contracts and DeFi basics', 'Understand token contracts and DeFi protocols'
FROM training_topics t 
JOIN training_weeks w ON t.week_id = w.id 
WHERE w.week_number = 2 AND t.title = 'Advanced smart contracts and DeFi basics'
LIMIT 1;

-- Insert week 3 data
INSERT INTO training_weeks (week_number, title, description) 
VALUES (3, 'Advanced (DeFi, Testing, Security)', 'Week 3: DeFi protocols, contract testing, and security best practices');

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'DeFi protocol fundamentals', 'Learn DeFi concepts and protocols'
FROM training_weeks WHERE week_number = 3;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Smart contract testing and security', 'Test and secure smart contracts'
FROM training_weeks WHERE week_number = 3;

-- Insert week 4 data
INSERT INTO training_weeks (week_number, title, description) 
VALUES (4, 'Project Development & Deployment', 'Week 4: Build and deploy real-world applications');

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Full-stack DApp development', 'Build complete decentralized applications'
FROM training_weeks WHERE week_number = 4;

INSERT INTO training_topics (week_id, title, description)
SELECT id, 'Deployment and optimization', 'Deploy to mainnet and optimize performance'
FROM training_weeks WHERE week_number = 4;
