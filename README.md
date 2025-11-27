# Supabase Seeder Example

Seed a Supabase database with fake data using [Faker.js](https://fakerjs.dev/). This example creates an AI agent platform schema with users, agents, chat runs, messages, and actions.

## What's Inside

- **7 tables** with proper foreign key relationships
- **~26,000 records** of realistic fake data
- **Preview mode** to test data generation before inserting
- **Full schema documentation** with ERD

## Prerequisites

- Node.js 18+
- A Supabase project
- pnpm (or npm/yarn)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment file

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

Find these values in your Supabase dashboard:

- Go to **Settings** → **API**
- Copy the **Project URL**
- Copy the **service_role** key (under Project API keys → "Legacy anon, service_role API keys" tab)

### 3. Create the database tables

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Paste the contents of `database/schema.sql`
4. Click **Run**

### 4. Preview the data (optional)

Test what data will be generated without inserting anything:

```bash
node database/seed-preview.js
```

Save the preview to a JSON file:

```bash
node database/seed-preview.js --save
```

### 5. Seed the database

```bash
node --env-file=.env database/seed.js
```

## Data Generated

| Table                  | Records |
| ---------------------- | ------- |
| user                   | 20      |
| agent                  | 200     |
| agent_action           | 20      |
| agent_run              | 2,000   |
| agent_run_message      | ~13,000 |
| agent_run_user_message | ~10,000 |
| agent_run_action       | ~1,100  |

All data is spread across the past 8 weeks with realistic timestamps.

## Schema Documentation

See [SCHEMA.md](./SCHEMA.md) for detailed documentation including:

- Table descriptions and column definitions
- Foreign key relationships
- Entity relationship diagram
- Common query patterns

## Example Queries

**Most popular agents (past 2 weeks):**

```sql
SELECT a.name, COUNT(ar.id) as run_count
FROM agent_run ar
JOIN agent a ON a.id = ar.agent_id
WHERE ar.created_at > NOW() - INTERVAL '2 weeks'
GROUP BY a.id, a.name
ORDER BY run_count DESC;
```

**Failed runs by agent (past month):**

```sql
SELECT a.name, COUNT(ar.id) as failed_runs
FROM agent_run ar
JOIN agent a ON a.id = ar.agent_id
WHERE ar.status = 'has_error'
  AND ar.created_at > NOW() - INTERVAL '1 month'
GROUP BY a.id, a.name
ORDER BY failed_runs DESC;
```

## Customisation

Edit the constants at the top of `database/seed.js` to adjust data volumes:

```javascript
const NUM_USERS = 20;
const NUM_AGENTS = 200;
const NUM_AGENT_ACTIONS = 20;
const NUM_AGENT_RUNS = 2000;
```

## Files

```
├── database/
│   ├── schema.sql        # SQL to create tables
│   ├── seed.js           # Main seed script
│   └── seed-preview.js   # Preview data without inserting
├── SCHEMA.md             # Schema documentation
└── README.md             # You are here
```

## Credits

Based on [devinschumacher's Supabase seeding gist](https://gist.github.com/devinschumacher/5fb66aebc4bacb2ca8746f57cd0ab0ce).
