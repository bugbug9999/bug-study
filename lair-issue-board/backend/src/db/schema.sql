-- Lair Issue Board Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (GitHub OAuth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  github_login VARCHAR(100) NOT NULL,
  github_name VARCHAR(200),
  github_avatar_url TEXT,
  github_email VARCHAR(200),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'developer', 'lead')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Status flow: pending -> review -> in_review -> in_progress -> done
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'in_review', 'in_progress', 'done')),

  -- Reporter info
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name VARCHAR(200),

  -- Original raw input from user
  raw_input TEXT NOT NULL,

  -- AI-processed fields (editable)
  title VARCHAR(500),
  category VARCHAR(20) CHECK (category IN ('bug', 'ux_ui', 'feature', 'performance', 'other')),
  priority VARCHAR(15) CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  description TEXT,
  resolution_suggestion TEXT,

  -- Manual fields
  source VARCHAR(30) CHECK (source IN ('discord', 'telegram', 'x', 'internal', 'partner', 'other')),
  chain VARCHAR(100),
  version VARCHAR(50),

  -- GitHub integration
  github_issue_number INTEGER,
  github_issue_url TEXT,
  github_issue_id BIGINT,

  -- Assignee
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assignee_github_login VARCHAR(100),

  -- Related issues (GitHub issue numbers)
  related_issues INTEGER[],

  -- PR tracking
  linked_pr_number INTEGER,
  linked_pr_url TEXT,

  -- AI processing state
  ai_status VARCHAR(20) DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Activity Logs
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  detail TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (synced with GitHub)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_github_login VARCHAR(100),
  author_name VARCHAR(200),
  body TEXT NOT NULL,
  github_comment_id BIGINT UNIQUE,
  source VARCHAR(20) DEFAULT 'board' CHECK (source IN ('board', 'github')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue status change history
CREATE TABLE IF NOT EXISTS issue_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  changed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_by_name VARCHAR(200),
  field_changed VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_reporter ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_github_number ON issues(github_issue_number);
CREATE INDEX IF NOT EXISTS idx_ai_logs_issue ON ai_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_issue ON issue_history(issue_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
