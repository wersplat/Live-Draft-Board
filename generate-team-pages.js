import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase config
const supabase = createClient(
  'https://suqhwtwfvpcyvcbnycsa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cWh3dHdmdnBjeXZjYm55Y3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mzk2MzAsImV4cCI6MjA2NzAxNTYzMH0.ROawOqve1AezL2Asi0MqcWy4GbISImG_CNbaXxNg2lo'
);

// Fetch all picks
const { data: picks, error } = await supabase
  .from('draft_picks')
  .select('*')
  .order('pick');

if (error) throw error;

// Group picks by team_slug
const teams = {};
for (const pick of picks) {
  const slug = pick.team_slug || pick.team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  if (!teams[slug]) {
    teams[slug] = { name: pick.team, picks: [] };
  }
  teams[slug].picks.push(pick);
}

// Load HTML template
const templatePath = path.join(__dirname, 'templates/team.html');
const template = await fs.readFile(templatePath, 'utf-8');

// Create output dir if missing
const outputDir = path.join(__dirname, 'teams');
await fs.mkdir(outputDir, { recursive: true });

// Generate each team page
for (const [slug, teamData] of Object.entries(teams)) {
  const listHTML = teamData.picks.map(p =>
    `<li>Round ${p.round}, Pick #${p.pick}: ${p.player}</li>`
  ).join('\n    ');

  const html = template
    .replace(/{{team}}/g, teamData.name)
    .replace(/{{players}}/g, listHTML)
    .replace(/{{slug}}/g, slug);

  const filePath = path.join(outputDir, `${slug}.html`);
  await fs.writeFile(filePath, html);
  console.log(`✅ Created: teams/${slug}.html`);
}

// Generate search index page
const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>All Draft Teams</title>
  <style>
    body { background: #000; color: #fff; font-family: sans-serif; padding: 2rem; }
    h1 { color: #B6094B; font-size: 2rem; margin-bottom: 1rem; }
    input { width: 100%; padding: 0.6rem; font-size: 1rem; margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; font-size: 1.2rem; }
    li { margin-bottom: 0.5rem; }
    a { color: #fff; text-decoration: none; }
    a:hover { color: #B6094B; }
  </style>
</head>
<body>
  <h1>All UPA Draft Teams</h1>
  <input type="text" id="search" placeholder="Search team name..." />

  <ul id="team-list">
    ${Object.entries(teams).map(([slug, team]) => {
      return `<li><a href="./${slug}.html">${team.name}</a></li>`;
    }).join('\n    ')}
  </ul>

  <script>
    const input = document.getElementById('search');
    const list = document.getElementById('team-list');
    const items = [...list.querySelectorAll('li')];

    input.addEventListener('input', () => {
      const val = input.value.toLowerCase();
      items.forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(val) ? '' : 'none';
      });
    });
  </script>
</body>
</html>
`;

await fs.writeFile(path.join(outputDir, 'index.html'), indexHTML);
console.log(`✅ Created: teams/index.html with live search`);