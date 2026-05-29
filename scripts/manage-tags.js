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
  console.log('\n🏷️  Portfolio Tag Manager 🏷️\n');

  const projectsFilePath = path.join(__dirname, '../src/data/projects.json');
  let projectsData = [];
  try {
    projectsData = JSON.parse(fs.readFileSync(projectsFilePath, 'utf8'));
  } catch (err) {
    console.error('Error reading projects.json:', err);
    rl.close();
    return;
  }

  while (true) {
    // Gather unique tags
    const allTags = new Set();
    projectsData.forEach(p => {
      p.filters.forEach(t => allTags.add(t));
    });
    const tagsArray = Array.from(allTags).sort();

    if (tagsArray.length === 0) {
      console.log('No tags found in any projects.');
      break;
    }

    console.log('\nCurrent Tags:');
    tagsArray.forEach((tag, idx) => {
      console.log(`${idx + 1}. ${tag}`);
    });

    console.log('\nOptions:');
    console.log('1. Rename a tag globally');
    console.log('2. Delete a tag globally');
    console.log('3. Manage tags for a specific project');
    console.log('4. Exit');

    const choice = await question('\nSelect an option (1-4): ');

    if (choice === '4' || choice.toLowerCase() === 'exit') {
      break;
    }

    if (choice === '1' || choice === '2') {
      const idxInput = await question(`Select a tag number (1-${tagsArray.length}): `);
      const tagIndex = parseInt(idxInput) - 1;

      if (isNaN(tagIndex) || tagIndex < 0 || tagIndex >= tagsArray.length) {
        console.log('Invalid selection.');
        continue;
      }

      const selectedTag = tagsArray[tagIndex];

      if (choice === '1') {
        const newTag = await question(`Enter new name for "${selectedTag}": `);
        if (newTag.trim() && newTag.trim() !== selectedTag) {
          let updatedCount = 0;
          projectsData.forEach(p => {
            const idx = p.filters.indexOf(selectedTag);
            if (idx !== -1) {
              p.filters[idx] = newTag.trim();
              updatedCount++;
            }
          });
          fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
          console.log(`\n✅ Renamed "${selectedTag}" to "${newTag.trim()}" in ${updatedCount} project(s).`);
        } else {
          console.log('\nRename cancelled or name unchanged.');
        }
      } else if (choice === '2') {
        const confirm = await question(`Are you sure you want to delete the tag "${selectedTag}" from all projects? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
          let updatedCount = 0;
          projectsData.forEach(p => {
            if (p.filters.includes(selectedTag)) {
              p.filters = p.filters.filter(t => t !== selectedTag);
              updatedCount++;
            }
          });
          fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
          console.log(`\n✅ Deleted tag "${selectedTag}" from ${updatedCount} project(s).`);
        } else {
          console.log('\nDeletion cancelled.');
        }
      }
    } else if (choice === '3') {
      console.log('\nProjects:');
      projectsData.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.title} (Tags: ${p.filters.join(', ') || 'None'})`);
      });
      const pIdxInput = await question(`Select a project number (1-${projectsData.length}): `);
      const pIdx = parseInt(pIdxInput) - 1;
      
      if (isNaN(pIdx) || pIdx < 0 || pIdx >= projectsData.length) {
        console.log('Invalid project selection.');
        continue;
      }

      const proj = projectsData[pIdx];
      console.log(`\nManaging tags for "${proj.title}"`);
      console.log('1. Add a tag');
      console.log('2. Remove a tag');
      const action = await question('Select an action (1-2): ');

      if (action === '1') {
        const newTag = await question('Enter the new tag to add: ');
        if (newTag.trim() && !proj.filters.includes(newTag.trim())) {
          proj.filters.push(newTag.trim());
          fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
          console.log(`\n✅ Added tag "${newTag.trim()}" to "${proj.title}".`);
        } else {
          console.log('\nTag already exists or was empty.');
        }
      } else if (action === '2') {
        if (proj.filters.length === 0) {
          console.log('\nThis project has no tags to remove.');
          continue;
        }
        console.log('\nCurrent Tags:');
        proj.filters.forEach((t, i) => console.log(`${i + 1}. ${t}`));
        const tIdxInput = await question(`Select a tag to remove (1-${proj.filters.length}): `);
        const tIdx = parseInt(tIdxInput) - 1;
        if (!isNaN(tIdx) && tIdx >= 0 && tIdx < proj.filters.length) {
          const removed = proj.filters.splice(tIdx, 1)[0];
          fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2));
          console.log(`\n✅ Removed tag "${removed}" from "${proj.title}".`);
        } else {
          console.log('\nInvalid selection.');
        }
      } else {
        console.log('Invalid action.');
      }
    } else {
      console.log('Invalid option.');
    }
  }

  console.log('\nExiting Tag Manager. Goodbye!');
  rl.close();
}

main();
