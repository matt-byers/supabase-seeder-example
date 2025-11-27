/* eslint-env node */
import { faker } from '@faker-js/faker';
import { writeFileSync } from 'fs';

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

function generateUsers() {
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    users.push({
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      name: `${firstName} ${lastName}`,
      created_at: getRandomDateInPastWeeks(8),
    });
  }
  return users;
}

function generateAgentActions() {
  return AGENT_ACTION_TEMPLATES.slice(0, NUM_AGENT_ACTIONS).map((template) => ({
    id: faker.string.uuid(),
    ...template,
    created_at: getRandomDateInPastWeeks(8),
  }));
}

function generateAgents(users) {
  const agents = [];
  for (let i = 0; i < NUM_AGENTS; i++) {
    agents.push({
      id: faker.string.uuid(),
      name: generateAgentName(),
      description: generateAgentDescription(),
      created_by: faker.helpers.arrayElement(users).id,
      created_at: getRandomDateInPastWeeks(8),
    });
  }
  return agents;
}

function generateAgentRuns(users, agents) {
  const runs = [];
  for (let i = 0; i < NUM_AGENT_RUNS; i++) {
    const createdAt = getRandomDateInPastWeeks(8);
    const status = getRandomStatus();
    runs.push({
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(users).id,
      agent_id: faker.helpers.arrayElement(agents).id,
      status,
      created_at: createdAt,
      updated_at: status !== 'running' ? new Date(createdAt.getTime() + faker.number.int({ min: 30000, max: 600000 })) : null,
    });
  }
  return runs;
}

function generateAgentRunMessages(runs, agents) {
  const messages = [];
  for (const run of runs) {
    const numMessages = faker.number.int({ min: 3, max: 10 });
    let messageTime = new Date(run.created_at);
    for (let i = 0; i < numMessages; i++) {
      messageTime = new Date(messageTime.getTime() + faker.number.int({ min: 5000, max: 60000 }));
      messages.push({
        id: faker.string.uuid(),
        agent_run_id: run.id,
        agent_id: faker.helpers.arrayElement(agents).id,
        content: faker.lorem.sentences({ min: 1, max: 3 }),
        created_at: messageTime,
      });
    }
  }
  return messages;
}

function generateAgentRunUserMessages(runs) {
  const messages = [];
  for (const run of runs) {
    const numMessages = faker.number.int({ min: 2, max: 8 });
    let messageTime = new Date(run.created_at);
    for (let i = 0; i < numMessages; i++) {
      messageTime = new Date(messageTime.getTime() + faker.number.int({ min: 3000, max: 45000 }));
      messages.push({
        id: faker.string.uuid(),
        agent_run_id: run.id,
        user_id: run.user_id,
        content: faker.lorem.sentences({ min: 1, max: 2 }),
        created_at: messageTime,
      });
    }
  }
  return messages;
}

function generateAgentRunActions(runs, agents, actions) {
  const runActions = [];
  for (const run of runs) {
    if (run.status === 'took_action' || Math.random() < 0.3) {
      const numActions = faker.number.int({ min: 1, max: 2 });
      let actionTime = new Date(run.created_at);
      for (let i = 0; i < numActions; i++) {
        actionTime = new Date(actionTime.getTime() + faker.number.int({ min: 10000, max: 120000 }));
        runActions.push({
          id: faker.string.uuid(),
          agent_run_id: run.id,
          agent_id: faker.helpers.arrayElement(agents).id,
          agent_action_id: faker.helpers.arrayElement(actions).id,
          created_at: actionTime,
        });
      }
    }
  }
  return runActions;
}

function printSamples(name, data, count = 3) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${name} (${data.length} total records)`);
  console.log('='.repeat(60));
  console.log('\nSample records:');
  data.slice(0, count).forEach((record, i) => {
    console.log(`\n[${i + 1}]`, JSON.stringify(record, null, 2));
  });
}

function main() {
  console.log('🔍 PREVIEW MODE - No data will be inserted\n');
  console.log('Generating fake data...\n');

  const users = generateUsers();
  const agentActions = generateAgentActions();
  const agents = generateAgents(users);
  const runs = generateAgentRuns(users, agents);
  const agentMessages = generateAgentRunMessages(runs, agents);
  const userMessages = generateAgentRunUserMessages(runs);
  const runActions = generateAgentRunActions(runs, agents, agentActions);

  printSamples('USER', users);
  printSamples('AGENT', agents);
  printSamples('AGENT_ACTION', agentActions);
  printSamples('AGENT_RUN', runs);
  printSamples('AGENT_RUN_MESSAGE', agentMessages);
  printSamples('AGENT_RUN_USER_MESSAGE', userMessages);
  printSamples('AGENT_RUN_ACTION', runActions);

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`
  user:                   ${users.length} records
  agent:                  ${agents.length} records
  agent_action:           ${agentActions.length} records
  agent_run:              ${runs.length} records
  agent_run_message:      ${agentMessages.length} records
  agent_run_user_message: ${userMessages.length} records
  agent_run_action:       ${runActions.length} records
  `);

  const saveToFile = process.argv.includes('--save');
  if (saveToFile) {
    const allData = {
      user: users,
      agent: agents,
      agent_action: agentActions,
      agent_run: runs,
      agent_run_message: agentMessages,
      agent_run_user_message: userMessages,
      agent_run_action: runActions,
    };
    writeFileSync('database/preview-data.json', JSON.stringify(allData, null, 2));
    console.log('💾 Data saved to database/preview-data.json');
  } else {
    console.log('💡 Tip: Run with --save to export all data to preview-data.json');
  }

  console.log('\n✅ Preview complete! If this looks good, run seed.js to insert into Supabase.');
}

main();

