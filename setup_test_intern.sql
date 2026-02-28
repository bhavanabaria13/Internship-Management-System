
-- First, insert a test intern application
INSERT INTO interns (name, email, phone, college, course, year_of_study, skills, projects, portfolio_url, linkedin_url, availability, resume_url, created_at)
VALUES (
  'Bhavnan Test',
  'bhavnan@etherauthority.io',
  '1234567890',
  'Test University',
  'Computer Science',
  3,
  ARRAY['JavaScript', 'React', 'Node.js'],
  'Sample blockchain project',
  'https://github.com/test',
  'https://linkedin.com/in/test',
  'Full-time',
  '/uploads/test-resume.pdf',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  college = EXCLUDED.college;

-- Create the user account with password '123456'
-- Note: This hash is for the password '123456'
INSERT INTO intern_users (intern_id, password, is_approved)
SELECT id, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1
FROM interns
WHERE email = 'bhavnan@etherauthority.io'
ON CONFLICT (intern_id) DO UPDATE SET
  password = EXCLUDED.password,
  is_approved = 1;
