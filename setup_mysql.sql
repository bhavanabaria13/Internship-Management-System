
-- Create the interns table
CREATE TABLE IF NOT EXISTS interns (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  workExperience TEXT,
  education VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  github VARCHAR(255),
  linkedin VARCHAR(255),
  skills TEXT NOT NULL,
  projects TEXT,
  cvFilename VARCHAR(255),
  cvOriginalName VARCHAR(255),
  appliedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_appliedDate (appliedDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
