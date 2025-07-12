import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  const raw = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(raw);
}

async function main() {
  try {
    const config = await loadConfig();
    const { data: picks, error } = await supabase.from('draft_picks').select('*').order('pick');
    if (error) throw error;

    const teams = {};
    for (const pick of picks) {
      const slug = pick.team_slug || pick.team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
      if (!teams[slug]) teams[slug] = { name: pick.team, picks: [] };
      teams[slug].picks.push(pick);
    }

    const templatePath = path.join(__dirname, 'templates/team.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    const outputDir = path.join(__dirname, 'teams');
    await fs.mkdir(outputDir, { recursive: true });

    for (const [slug, teamData] of Object.entries(teams)) {
      const listHTML = teamData.picks.map(p => `
        <li>Round ${p.round}, Pick #${p.pick}: ${p.player}${p.notes ? ` (${p.notes})` : ''}${p.traded ? ' (Traded)' : ''}</li>
      `).join('');

      let logoHTML = '';
      const logoPath = path.join(__dirname, 'logos', `${slug}.png`);
      try {
        await fs.access(logoPath);
        logoHTML = `<img class="logo" src="../logos/${slug}.png" alt="${teamData.name} logo">`;
      } catch {}

      let html = template
        .replace(/{{eventTitle}}/g, config.eventTitle)
        .replace('{{team}}', teamData.name)
        .replace('{{players}}', listHTML)
        .replace('{{logo}}', logoHTML);

      const filePath = path.join(outputDir, `${slug}.html`);
      await fs.writeFile(filePath, html);
      console.log(`✅ Created: teams/${slug}.html`);
    }

    const sortedSlugs = Object.keys(teams).sort();
    const linksHTML = sortedSlugs.map(slug => `<li><a href="${slug}.html">${teams[slug].name}</a></li>`).join('\n');

    const searchScript = `
      <input id="search" type="text" placeholder="Search teams..." aria-label="Search teams">
      <script>
        document.getElementById('search').addEventListener('input', e => {
          const term = e.target.value.toLowerCase();
          document.querySelectorAll('#team-list li').forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(term) ? 'list-item' : 'none';
          });
        });
      </script>
    `;

    let prizesHTML = '';
    if (config.prizeBreakdown && config.prizeBreakdown.length > 0) {
      prizesHTML = '<h3>Prize Breakdown</h3><ul>' + config.prizeBreakdown.map(p => `<li>${p.place}st Place: ${config.currency} ${p.amount}</li>`).join('') + '</ul>';
    }

    const rulesLink = config.rulesUrl ? `<p><a href="${config.rulesUrl}">Event Rules</a></p>` : '';

    const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>All Teams - ${config.eventTitle}</title>
  <style>body { font-family: Arial, sans-serif; padding: 20px; } ul { list-style: none; }</style>
</head>
<body>
  <h1>All Draft Teams - ${config.eventTitle}</h1>
  ${rulesLink}
  ${prizesHTML}
  ${searchScript}
  <ul id="team-list">
    ${linksHTML}
  </ul>
</body>
</html>
    `;

    await fs.writeFile(path.join(outputDir, 'index.html'), indexHTML);
    console.log(`✅ Created: teams/index.html with live search`);
  } catch (err) {
    console.error('Error generating pages:', err);
    process.exit(1);
  }
}

main();