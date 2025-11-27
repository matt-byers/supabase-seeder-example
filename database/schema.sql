CREATE TABLE "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES "user"(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES "user"(id),
  agent_id uuid REFERENCES agent(id),
  status text CHECK (status IN ('running', 'completed', 'has_error', 'took_action')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE agent_run_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid REFERENCES agent_run(id),
  agent_id uuid REFERENCES agent(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent_run_user_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid REFERENCES agent_run(id),
  user_id uuid REFERENCES "user"(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent_run_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid REFERENCES agent_run(id),
  agent_id uuid REFERENCES agent(id),
  agent_action_id uuid REFERENCES agent_action(id),
  created_at timestamptz DEFAULT now()
);

