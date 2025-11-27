# Agent Platform Database Schema

## Overview

This database models an AI agent platform where users can interact with various AI agents through chat-based "runs". Agents can send messages, receive user messages, and take actions during these conversations.

---

## Tables

### user

Platform users who interact with AI agents.

| Column     | Type        | Description               |
| ---------- | ----------- | ------------------------- |
| id         | uuid        | Primary key               |
| email      | text        | User's email address      |
| name       | text        | User's display name       |
| created_at | timestamptz | When the user was created |

**Relationships:**

- Referenced by `agent.created_by`
- Referenced by `agent_run.user_id`
- Referenced by `agent_run_user_message.user_id`

---

### agent

AI agents that users can interact with.

| Column      | Type        | Description                                                    |
| ----------- | ----------- | -------------------------------------------------------------- |
| id          | uuid        | Primary key                                                    |
| name        | text        | Agent's display name (e.g. "Research Buddy", "Code Assistant") |
| description | text        | What the agent does                                            |
| created_by  | uuid        | FK → `user.id` - Who created this agent                        |
| created_at  | timestamptz | When the agent was created                                     |

**Relationships:**

- References `user.created_by`
- Referenced by `agent_run.agent_id`
- Referenced by `agent_run_message.agent_id`
- Referenced by `agent_run_action.agent_id`

---

### agent_action

A catalogue of possible actions that agents can perform.

| Column      | Type        | Description                                                        |
| ----------- | ----------- | ------------------------------------------------------------------ |
| id          | uuid        | Primary key                                                        |
| name        | text        | Action identifier (e.g. "send_email", "search_web", "create_task") |
| description | text        | Human-readable description of what the action does                 |
| created_at  | timestamptz | When the action was defined                                        |

**Relationships:**

- Referenced by `agent_run_action.agent_action_id`

---

### agent_run

A conversation session between a user and an agent. This is the core entity for tracking agent interactions.

| Column     | Type        | Description                                                       |
| ---------- | ----------- | ----------------------------------------------------------------- |
| id         | uuid        | Primary key                                                       |
| user_id    | uuid        | FK → `user.id` - Who initiated this run                           |
| agent_id   | uuid        | FK → `agent.id` - Primary agent for this run                      |
| status     | text        | Current state: `running`, `completed`, `has_error`, `took_action` |
| created_at | timestamptz | When the run started                                              |
| updated_at | timestamptz | When the run last changed (null if still running)                 |

**Status values:**

- `running` - Conversation is active
- `completed` - Conversation finished successfully
- `has_error` - Something went wrong during the run
- `took_action` - Agent performed an action (e.g. sent an email)

**Relationships:**

- References `user.user_id`
- References `agent.agent_id`
- Referenced by `agent_run_message.agent_run_id`
- Referenced by `agent_run_user_message.agent_run_id`
- Referenced by `agent_run_action.agent_run_id`

---

### agent_run_message

Messages sent by agents during a run.

| Column       | Type        | Description                                             |
| ------------ | ----------- | ------------------------------------------------------- |
| id           | uuid        | Primary key                                             |
| agent_run_id | uuid        | FK → `agent_run.id` - Which run this message belongs to |
| agent_id     | uuid        | FK → `agent.id` - Which agent sent this message         |
| content      | text        | The message content                                     |
| created_at   | timestamptz | When the message was sent                               |

**Note:** A run can have messages from multiple agents (for multi-agent scenarios), which is why `agent_id` is stored on each message rather than just on the run.

**Relationships:**

- References `agent_run.agent_run_id`
- References `agent.agent_id`

---

### agent_run_user_message

Messages sent by users during a run.

| Column       | Type        | Description                                             |
| ------------ | ----------- | ------------------------------------------------------- |
| id           | uuid        | Primary key                                             |
| agent_run_id | uuid        | FK → `agent_run.id` - Which run this message belongs to |
| user_id      | uuid        | FK → `user.id` - Who sent this message                  |
| content      | text        | The message content                                     |
| created_at   | timestamptz | When the message was sent                               |

**Relationships:**

- References `agent_run.agent_run_id`
- References `user.user_id`

---

### agent_run_action

Actions performed by agents during a run.

| Column          | Type        | Description                                                |
| --------------- | ----------- | ---------------------------------------------------------- |
| id              | uuid        | Primary key                                                |
| agent_run_id    | uuid        | FK → `agent_run.id` - Which run this action occurred in    |
| agent_id        | uuid        | FK → `agent.id` - Which agent performed the action         |
| agent_action_id | uuid        | FK → `agent_action.id` - What type of action was performed |
| created_at      | timestamptz | When the action was performed                              |

**Relationships:**

- References `agent_run.agent_run_id`
- References `agent.agent_id`
- References `agent_action.agent_action_id`

---

## Entity Relationship Diagram

```
┌──────────┐
│   user   │
└────┬─────┘
     │
     ├──────────────────────────────────────┐
     │                                      │
     ▼                                      ▼
┌──────────┐                    ┌───────────────────────┐
│  agent   │                    │  agent_run_user_msg   │
└────┬─────┘                    └───────────────────────┘
     │                                      ▲
     │                                      │
     ▼                                      │
┌──────────────┐       ┌──────────────┐     │
│ agent_action │       │  agent_run   │─────┤
└──────┬───────┘       └──────┬───────┘     │
       │                      │             │
       │                      ├─────────────┤
       │                      │             │
       │                      ▼             │
       │          ┌───────────────────┐     │
       │          │ agent_run_message │     │
       │          └───────────────────┘     │
       │                                    │
       ▼                                    │
┌──────────────────┐                        │
│ agent_run_action │────────────────────────┘
└──────────────────┘
```

---

## Common Query Patterns

### Get all messages for a run (both agent and user)

```sql
SELECT 'agent' as sender_type, content, created_at
FROM agent_run_message WHERE agent_run_id = 'xxx'
UNION ALL
SELECT 'user' as sender_type, content, created_at
FROM agent_run_user_message WHERE agent_run_id = 'xxx'
ORDER BY created_at;
```

### Get agent performance stats

```sql
SELECT
  a.name,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE ar.status = 'completed') as successful,
  COUNT(*) FILTER (WHERE ar.status = 'has_error') as failed
FROM agent_run ar
JOIN agent a ON a.id = ar.agent_id
GROUP BY a.id, a.name;
```

### Get most active users

```sql
SELECT u.name, COUNT(ar.id) as runs
FROM agent_run ar
JOIN "user" u ON u.id = ar.user_id
GROUP BY u.id, u.name
ORDER BY runs DESC;
```
