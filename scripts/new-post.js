import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n🌟 Portfolio Content Manager 🌟\n');

  const title = await question('What is the title of the project? ');
  
  // Generate ID from title
  let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  const customId = await question(`Project ID [${id}]: `);
  if (customId.trim()) id = customId.trim();

  const description = await question('Enter a short description: ');
  
  const rawFilters = await question('Enter tags (comma separated): ');
  const filters = rawFilters.split(',').map(f => f.trim()).filter(f => f);

  const isBlogInput = await question('Is this a local blog (local) or extenal link (link)? [local]: ');
  const isBlog = !isBlogInput.toLowerCase().includes('link');

  let url = `/blog/${id}`;
  let hasGithubRepo = false;

  if (!isBlog) {
    url = await question('Enter the external URL (e.g. GitHub link): ');
    hasGithubRepo = url.toLowerCase().includes('github.com');
  }

  const isFavInput = await question('Mark as a favorite project? (y/n) [n]: ');
  const isFavorite = isFavInput.toLowerCase().startsWith('y');

  console.log('\nGenerating files...\n');

  const projectsFilePath = path.join(__dirname, '../src/data/projects.json');
  const projectsData = JSON.parse(fs.readFileSync(projectsFilePath, 'utf8'));

  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  const newProject = {
    id,
    title,
    description,
    imagePath: `assets/${id}.avif`,
    videoPath: `assets/${id}.av1`,
    url,
    hasGithubRepo,
    isFavorite,
    datePosted: `${localDate}T00:00:00.000Z`,
    filters
  };

  projectsData.unshift(newProject);
  fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 4));
  console.log(`✅ Added "${title}" to src/data/projects.json`);

  if (isBlog) {
    const postsDir = path.join(__dirname, '../public/posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
    
    const mdPath = path.join(postsDir, `${id}.md`);
    const mdTemplate = `### This is a placeholder file.`;
    
    fs.writeFileSync(mdPath, mdTemplate);
  }

  console.log('\n🎉 ALL DONE! 🎉');
  
  if (isBlog) {
    console.log(`\n📝 Next Steps for your Blog Post:`);
    console.log(`1. Write your content in: public/posts/${id}.md`);
    console.log(`2. Drop your media files into:`);
    console.log(`   - Main Image: public/assets/${id}.avif`);
    console.log(`   - Main Video: public/assets/${id}.av1 (Optional)`);
    console.log(`   - Additional Media: public/assets/${id}_1.avif, public/assets/${id}_2.av1, etc.`);
  } else {
    console.log(`\n📝 Next Steps:`);
    console.log(`- Drop your Main Image into: public/assets/${id}.avif`);
    console.log(`- Drop your Main Video into: public/assets/${id}.av1 (Optional)`);
  }

  rl.close();
}

main().catch(err => {
  console.error(err);
  rl.close();
});
