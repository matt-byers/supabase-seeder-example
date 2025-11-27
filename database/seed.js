/* eslint-env node */
import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NUM_USERS = 20;
const NUM_AGENTS = 200;
const NUM_AGENT_ACTIONS = 20;
const NUM_AGENT_RUNS = 2000;

const AGENT_ACTION_TEMPLATES = [
  { name: 'send_email', description: 'Sends an email to specified recipient' },
  { name: 'create_task', description: 'Creates a task in project management tool' },
  { name: 'search_web', description: 'Searches the web for information' },
  { name: 'generate_report', description: 'Generates a report document' },
  { name: 'schedule_meeting', description: 'Schedules a calendar meeting' },
  { name: 'send_slack_message', description: 'Sends a message to a Slack channel' },
  { name: 'create_calendar_event', description: 'Creates a new calendar event' },
  { name: 'upload_file', description: 'Uploads a file to cloud storage' },
  { name: 'create_ticket', description: 'Creates a support ticket in helpdesk' },
  { name: 'send_sms', description: 'Sends an SMS to specified phone number' },
  { name: 'update_crm', description: 'Updates a record in the CRM system' },
  { name: 'create_invoice', description: 'Generates and sends an invoice' },
  { name: 'post_to_social', description: 'Posts content to social media' },
  { name: 'translate_text', description: 'Translates text to another language' },
  { name: 'summarise_document', description: 'Creates a summary of a document' },
  { name: 'create_spreadsheet', description: 'Creates a new spreadsheet with data' },
  { name: 'send_notification', description: 'Sends a push notification to user' },
  { name: 'book_appointment', description: 'Books an appointment in scheduling system' },
  { name: 'run_database_query', description: 'Executes a database query and returns results' },
  { name: 'generate_image', description: 'Generates an image using AI' },
];

const AGENT_NAME_PREFIXES = [
  'Smart', 'Quick', 'Pro', 'Super', 'Ultra', 'Mega', 'Turbo', 'Auto', 'Easy', 'Fast',
  'AI', 'Digital', 'Virtual', 'Cloud', 'Data', 'Cyber', 'Tech', 'Code', 'Logic', 'Neural',
];

const AGENT_NAME_SUFFIXES = [
  'Assistant', 'Helper', 'Buddy', 'Bot', 'Agent', 'Wizard', 'Genius', 'Expert', 'Pro', 'Master',
  'Companion', 'Advisor', 'Guide', 'Coach', 'Partner', 'Pilot', 'Copilot', 'Manager', 'Analyst', 'Writer',
];

const AGENT_DOMAINS = [
  'Research', 'Code', 'Email', 'Task', 'Data', 'Meeting', 'Document', 'Support', 'Social', 'Project',
  'Sales', 'Marketing', 'Finance', 'HR', 'Legal', 'Design', 'Content', 'Security', 'DevOps', 'Analytics',
];

function generateAgentName() {
  const prefix = faker.helpers.arrayElement(AGENT_NAME_PREFIXES);
  const domain = faker.helpers.arrayElement(AGENT_DOMAINS);
  const suffix = faker.helpers.arrayElement(AGENT_NAME_SUFFIXES);
  return `${prefix} ${domain} ${suffix}`;
}

function generateAgentDescription() {
  const actions = [
    'Helps with', 'Assists in', 'Automates', 'Streamlines', 'Manages', 'Handles',
    'Simplifies', 'Optimises', 'Coordinates', 'Facilitates',
  ];
  const tasks = [
    'daily tasks and workflows', 'complex data analysis', 'content creation and editing',
    'customer interactions', 'project management', 'research and summarisation',
    'scheduling and reminders', 'code review and debugging', 'report generation',
    'communication and collaboration', 'document processing', 'decision making',
  ];
  return `${faker.helpers.arrayElement(actions)} ${faker.helpers.arrayElement(tasks)}`;
}

const STATUS_WEIGHTS = [
  { status: 'completed', weight: 70 },
  { status: 'has_error', weight: 15 },
  { status: 'took_action', weight: 10 },
  { status: 'running', weight: 5 },
];

function getRandomStatus() {
  const random = Math.random() * 100;
  let cumulative = 0;
  for (const { status, weight } of STATUS_WEIGHTS) {
    cumulative += weight;
    if (random < cumulative) return status;
  }
  return 'completed';
}

function getRandomDateInPastWeeks(weeks) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: pastDate, to: now });
}

async function seedUsers() {
  console.log('Seeding users...');
  const users = [];

  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    users.push({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      name: `${firstName} ${lastName}`,
      created_at: getRandomDateInPastWeeks(8),
    });
  }

  const { data, error } = await supabase.from('user').insert(users).select();
  if (error) throw error;
  console.log(`Created ${data.length} users`);
  return data;
}

async function seedAgentActions() {
  console.log('Seeding agent actions...');
  const actions = AGENT_ACTION_TEMPLATES.slice(0, NUM_AGENT_ACTIONS).map((template) => ({
    ...template,
    created_at: getRandomDateInPastWeeks(8),
  }));

  const { data, error } = await supabase.from('agent_action').insert(actions).select();
  if (error) throw error;
  console.log(`Created ${data.length} agent actions`);
  return data;
}

async function seedAgents(users) {
  console.log('Seeding agents...');
  const agents = [];

  for (let i = 0; i < NUM_AGENTS; i++) {
    agents.push({
      name: generateAgentName(),
      description: generateAgentDescription(),
      created_by: faker.helpers.arrayElement(users).id,
      created_at: getRandomDateInPastWeeks(8),
    });
  }

  const { data, error } = await supabase.from('agent').insert(agents).select();
  if (error) throw error;
  console.log(`Created ${data.length} agents`);
  return data;
}

async function seedAgentRuns(users, agents) {
  console.log('Seeding agent runs...');
  const runs = [];

  for (let i = 0; i < NUM_AGENT_RUNS; i++) {
    const createdAt = getRandomDateInPastWeeks(8);
    const status = getRandomStatus();
    runs.push({
      user_id: faker.helpers.arrayElement(users).id,
      agent_id: faker.helpers.arrayElement(agents).id,
      status,
      created_at: createdAt,
      updated_at: status !== 'running' ? new Date(createdAt.getTime() + faker.number.int({ min: 30000, max: 600000 })) : null,
    });
  }

  const { data, error } = await supabase.from('agent_run').insert(runs).select();
  if (error) throw error;
  console.log(`Created ${data.length} agent runs`);
  return data;
}

async function seedAgentRunMessages(runs, agents) {
  console.log('Seeding agent run messages...');
  const messages = [];

  for (const run of runs) {
    const numMessages = faker.number.int({ min: 3, max: 10 });
    let messageTime = new Date(run.created_at);

    for (let i = 0; i < numMessages; i++) {
      messageTime = new Date(messageTime.getTime() + faker.number.int({ min: 5000, max: 60000 }));
      messages.push({
        agent_run_id: run.id,
        agent_id: faker.helpers.arrayElement(agents).id,
        content: faker.lorem.sentences({ min: 1, max: 3 }),
        created_at: messageTime,
      });
    }
  }

  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const { error } = await supabase.from('agent_run_message').insert(batch);
    if (error) throw error;
    inserted += batch.length;
  }
  console.log(`Created ${inserted} agent run messages`);
}

async function seedAgentRunUserMessages(runs, users) {
  console.log('Seeding agent run user messages...');
  const messages = [];

  for (const run of runs) {
    const numMessages = faker.number.int({ min: 2, max: 8 });
    let messageTime = new Date(run.created_at);

    for (let i = 0; i < numMessages; i++) {
      messageTime = new Date(messageTime.getTime() + faker.number.int({ min: 3000, max: 45000 }));
      messages.push({
        agent_run_id: run.id,
        user_id: run.user_id,
        content: faker.lorem.sentences({ min: 1, max: 2 }),
        created_at: messageTime,
      });
    }
  }

  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const { error } = await supabase.from('agent_run_user_message').insert(batch);
    if (error) throw error;
    inserted += batch.length;
  }
  console.log(`Created ${inserted} agent run user messages`);
}

async function seedAgentRunActions(runs, agents, actions) {
  console.log('Seeding agent run actions...');
  const runActions = [];

  for (const run of runs) {
    if (run.status === 'took_action' || Math.random() < 0.3) {
      const numActions = faker.number.int({ min: 1, max: 2 });
      let actionTime = new Date(run.created_at);

      for (let i = 0; i < numActions; i++) {
        actionTime = new Date(actionTime.getTime() + faker.number.int({ min: 10000, max: 120000 }));
        runActions.push({
          agent_run_id: run.id,
          agent_id: faker.helpers.arrayElement(agents).id,
          agent_action_id: faker.helpers.arrayElement(actions).id,
          created_at: actionTime,
        });
      }
    }
  }

  const { data, error } = await supabase.from('agent_run_action').insert(runActions).select();
  if (error) throw error;
  console.log(`Created ${data.length} agent run actions`);
}

async function main() {
  console.log('Starting database seed...\n');

  try {
    const users = await seedUsers();
    const agentActions = await seedAgentActions();
    const agents = await seedAgents(users);
    const runs = await seedAgentRuns(users, agents);
    await seedAgentRunMessages(runs, agents);
    await seedAgentRunUserMessages(runs, users);
    await seedAgentRunActions(runs, agents, agentActions);

    console.log('\nSeeding complete! 🎉');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();

