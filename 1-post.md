---
tags: ['faker','vue','nuxt','supabase']
---

# How to seed a supabase database with fake data from faker-js

## install faker & supabase-js client
```bash
pnpm i -D @faker-js/faker @supabase/supabase-js
```


## create a seed.js file that youll use to generate fake/seed data
```bash
mkdir -p database && touch database/seed.js
```


## create the seed.js file with the functions/data objects you want to seed your db with

```js
// database/seed.js
/* eslint-env node */
import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)


const seedProjects = async () => {

  const name = faker.lorem.words(3);

   await supabase.from('projects').insert({
    name: name,
    slug: name.toLocaleLowerCase().replace(/ /g,'-'),
    status: faker.helpers.arrayElement(['in-progress','completed']),
    collaborators: faker.helpers.arrayElements([1,2,3])
  });
};

await seedProjects();
```


## run the command to seed the database
```bash
node --env-file=.env database/seed.js
```



