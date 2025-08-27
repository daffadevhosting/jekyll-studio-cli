#!/usr/bin/env node

// Import library yang dibutuhkan
import { Command } from 'commander';
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import yaml from 'yaml';
import inquirer from 'inquirer';
import updateNotifier from 'update-notifier';
import { createRequire } from 'module';

// --- NOTIFIKASI UPDATE ---
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');
const notifier = updateNotifier({ pkg: packageJson });

// Tampilkan notifikasi update jika ada
if (notifier.update) {
  notifier.notify({
    message: `Update tersedia! ${chalk.dim(notifier.update.current)} → ${chalk.green(notifier.update.latest)}\nJalankan ${chalk.cyan('npm install -g jekyll-studio')} untuk update.`,
    isGlobal: true
  });
  
  // Beri jeda 2 detik agar user bisa membaca notifikasi
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// --- Konfigurasi dan Fungsi Bantuan ---

const execAsync = promisify(exec);
const program = new Command();
const API_BASE_URL = process.env.JEKYLL_STUDIO_API_URL || 'http://localhost:3000/api';

// Fungsi untuk menampilkan header yang menarik
function showHeader() {
  console.log(chalk.blue(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║                ${chalk.bold('JEKYLL STUDIO CLI')}                 ║
  ║           ${chalk.yellow('Build Jekyll Sites with AI 🚀')}          ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `));
}

/**
 * Fungsi untuk menulis file-file dari struktur JSON ke disk.
 * @param {string} basePath - Path direktori tempat proyek akan dibuat.
 * @param {object} structure - Objek struktur situs dari API.
 */
async function writeStructureToDisk(basePath, structure) {
  const spinner = ora('Membuat struktur file...').start();
  
  try {
    await fs.ensureDir(basePath);

    // Buat Gemfile
    const gemfileContent = `source "https://rubygems.org"\n\ngem "jekyll", "~> 4.3"\n\ngroup :jekyll_plugins do\n  gem "jekyll-feed"\n  gem "jekyll-sitemap"\n  gem "jekyll-paginate"\nend\n`;
    await fs.writeFile(path.join(basePath, 'Gemfile'), gemfileContent);

    // Buat .gitignore
    const gitignoreContent = `node_modules/\n_site/\n.sass-cache/\n.jekyll-cache/\n.jekyll-metadata\n.bundle/\nvendor/\nGemfile.lock\n*.gem\n.DS_Store\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n`;
    await fs.writeFile(path.join(basePath, '.gitignore'), gitignoreContent);

    // Buat README.md untuk proyek
    const readmeContent = `# ${structure.title || 'Jekyll Site'}

${structure.description || 'A Jekyll site generated with Jekyll Studio AI'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   bundle install
   \`\`\`

2. Serve locally:
   \`\`\`bash
   bundle exec jekyll serve --livereload
   \`\`\`

3. Open in browser: http://localhost:4000
`;
    await fs.writeFile(path.join(basePath, 'README.md'), readmeContent);

    // Tulis file konfigurasi
    if (structure.config) {
      await fs.writeFile(path.join(basePath, '_config.yml'), yaml.stringify(structure.config));
    }

    // Tulis layouts
    if (structure.layouts && structure.layouts.length > 0) {
      const layoutsDir = path.join(basePath, '_layouts');
      await fs.ensureDir(layoutsDir);
      for (const layout of structure.layouts) {
        const layoutPath = path.join(layoutsDir, layout.name.endsWith('.html') ? layout.name : `${layout.name}.html`);
        await fs.writeFile(layoutPath, layout.content);
      }
    }

    // Tulis includes
    if (structure.includes && structure.includes.length > 0) {
      const includesDir = path.join(basePath, '_includes');
      await fs.ensureDir(includesDir);
      for (const include of structure.includes) {
        const includePath = path.join(includesDir, include.name.endsWith('.html') ? include.name : `${include.name}.html`);
        await fs.writeFile(includePath, include.content);
      }
    }

    // Tulis posts
    if (structure.posts && structure.posts.length > 0) {
      const postsDir = path.join(basePath, '_posts');
      await fs.ensureDir(postsDir);
      for (const post of structure.posts) {
        const filename = `${post.date}-${post.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.md`;
        await fs.writeFile(path.join(postsDir, filename), post.content);
      }
    }

    // Tulis pages
    if (structure.pages && structure.pages.length > 0) {
      for (const page of structure.pages) {
        const pagePath = path.join(basePath, page.name.endsWith('.html') || page.name.endsWith('.md') ? page.name : `${page.name}.html`);
        await fs.writeFile(pagePath, page.content);
      }
    }

    // Tulis assets
    if (structure.assets) {
      const assetsDir = path.join(basePath, 'assets');
      await fs.ensureDir(assetsDir);
      
      if (structure.assets.css) {
        const cssDir = path.join(assetsDir, 'css');
        await fs.ensureDir(cssDir);
        await fs.writeFile(path.join(cssDir, 'style.css'), structure.assets.css);
      }
      
      if (structure.assets.js) {
        const jsDir = path.join(assetsDir, 'js');
        await fs.ensureDir(jsDir);
        await fs.writeFile(path.join(jsDir, 'script.js'), structure.assets.js || '// JavaScript files will go here');
      }

      // Buat folder images jika tidak ada
      const imagesDir = path.join(assetsDir, 'images');
      await fs.ensureDir(imagesDir);
      await fs.writeFile(path.join(imagesDir, '.gitkeep'), '');
    }

    spinner.succeed('Struktur file berhasil dibuat!');
  } catch (error) {
    spinner.fail('Gagal membuat struktur file');
    throw error;
  }
}

/**
 * Menjalankan perintah Docker secara lokal.
 */
async function runDockerCommand(command, successMessage = 'Command finished.') {
  const spinner = ora(`Running: ${command.split(' ')[0]}...`).start();
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
    spinner.succeed(successMessage);
    if (stdout) console.log(chalk.gray(stdout));
    if (stderr) console.error(chalk.yellow(stderr));
    return true;
  } catch (error) {
    spinner.fail('Command failed.');
    console.error(chalk.red(error.stderr || error.message));
    return false;
  }
}

/**
 * Fungsi untuk memeriksa apakah Docker tersedia
 */
async function checkDocker() {
  try {
    await execAsync('docker --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Fungsi untuk memeriksa apakah Jekyll tersedia secara lokal
 */
async function checkJekyll() {
  try {
    await execAsync('jekyll --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Fungsi untuk menangani error API
 */
function handleApiError(error) {
  if (error.response) {
    console.error(chalk.red(`  Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan di server'}`));
    if (error.response.status === 404) {
      console.log(chalk.yellow('  Pastikan Jekyll Studio API sudah berjalan di http://localhost:3000'));
    }
  } else if (error.code === 'ECONNREFUSED') {
    console.error(chalk.red('  Tidak dapat terhubung ke Jekyll Studio API'));
    console.log(chalk.yellow('  Pastikan API sudah berjalan: npm run dev (di folder API)'));
    console.log(chalk.yellow('  Atau set environment variable: export JEKYLL_STUDIO_API_URL=<your-api-url>'));
  } else {
    console.error(chalk.red(`  Kesalahan tidak terduga: ${error.message}`));
  }
}

// --- Definisi Perintah CLI ---

program
  .name('jekyll-studio')
  .description('CLI untuk mengelola situs Jekyll dengan kekuatan AI 🚀')
  .version('1.2.0')
  .hook('preAction', () => {
    showHeader();
  });

// Perintah: create
program
  .command('create')
  .description('Buat situs Jekyll baru dari prompt AI dan simpan secara lokal.')
  .argument('<prompt>', 'Deskripsi situs yang ingin kamu buat')
  .option('-n, --name <siteName>', 'Tentukan nama direktori untuk situs')
  .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
  .action(async (prompt, options) => {
    const spinner = ora('🧠 Menghubungi AI untuk merancang situsmu...').start();
    
    try {
      const response = await axios.post(`${API_BASE_URL}/cli/create`, { 
        prompt,
        options: {
          useTailwind: prompt.toLowerCase().includes('tailwind')
        }
      });
      
      const { structure } = response.data;
      const siteName = options.name || structure.name || 'jekyll-site';
      const sitePath = path.join(process.cwd(), siteName);

      // Periksa jika direktori sudah ada
      if (await fs.pathExists(sitePath)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Direktori "${siteName}" sudah ada. Timpa?`,
            default: false
          }
        ]);
        
        if (!overwrite) {
          spinner.fail('Dibatalkan oleh pengguna.');
          return;
        }
        
        await fs.remove(sitePath);
      }

      spinner.text = '📁 Membuat struktur file...';
      await writeStructureToDisk(sitePath, structure);
      
      spinner.succeed(chalk.green('✅ Proyek berhasil dibuat!'));
      
      console.log(`
  ${chalk.bold('📁 Lokasi:')} ${chalk.cyan(sitePath)}
  ${chalk.bold('🏷️  Nama:')} ${chalk.cyan(structure.title)}
  ${chalk.bold('📝 Deskripsi:')} ${chalk.cyan(structure.description)}
  
  ${chalk.bold('Untuk memulai:')}
  ${chalk.cyan(`cd ${siteName}`)}
  ${chalk.cyan('bundle install')}
  ${chalk.cyan('bundle exec jekyll serve --livereload')}
  
  ${chalk.bold('Atau gunakan Docker:')}
  ${chalk.cyan('jekyll-studio serve')}
      `);

    } catch (error) {
      spinner.fail(chalk.red('❌ Gagal membuat situs.'));
      handleApiError(error);
    }
  });

// Perintah: add
const addCommand = program.command('add')
  .description('Tambahkan konten baru ke proyek Jekyll yang ada dengan AI.');

addCommand
  .command('post')
  .description('Buat postingan blog baru dari sebuah judul.')
  .argument('<title>', 'Judul untuk postingan blog baru')
  .option('--tags <tags>', 'Tags untuk postingan (dipisahkan koma)')
  .option('--categories <categories>', 'Kategori untuk postingan (dipisahkan koma)')
  .action(async (title, options) => {
    const spinner = ora('✍️  AI sedang menulis postingan untukmu...').start();
    
    try {
      const response = await axios.post(`${API_BASE_URL}/cli/add/post`, { 
        title,
        tags: options.tags ? options.tags.split(',').map(t => t.trim()) : [],
        categories: options.categories ? options.categories.split(',').map(c => c.trim()) : []
      });
      
      const { content } = response.data;
      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}-${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.md`;

      const postsPath = path.join(process.cwd(), '_posts');
      await fs.ensureDir(postsPath);
      await fs.writeFile(path.join(postsPath, filename), content);

      spinner.succeed(chalk.green('✅ Postingan baru berhasil ditambahkan!'));
      console.log(`  ${chalk.bold('📄 File:')} ${chalk.cyan(path.join('_posts', filename))}`);

    } catch (error) {
      spinner.fail(chalk.red('❌ Gagal menambahkan postingan.'));
      handleApiError(error);
    }
  });

// Perintah: serve
program
  .command('serve')
  .description('Jalankan server pengembangan Jekyll lokal')
  .option('-p, --port <port>', 'Port yang akan digunakan', '4000')
  .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
  .action(async (options) => {
    const useDocker = options.docker && await checkDocker();
    
    if (useDocker) {
      console.log(chalk.blue('🐳 Menjalankan server dengan Docker...'));
      const projectPath = process.cwd();
      const dockerCommand = `docker run --rm -it -p ${options.port}:4000 -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll serve --livereload --force_polling`;
      
      console.log(chalk.yellow('Tekan Ctrl+C untuk menghentikan server\n'));
      await runDockerCommand(dockerCommand, 'Server Docker berjalan');
      
    } else {
      if (!await checkJekyll()) {
        console.error(chalk.red('❌ Jekyll tidak ditemukan. Install Jekyll atau gunakan Docker.'));
        console.log(chalk.cyan('Install Jekyll: https://jekyllrb.com/docs/installation/'));
        console.log(chalk.cyan('Atau gunakan: jekyll-studio serve --no-docker'));
        return;
      }
      
      console.log(chalk.blue('🚀 Menjalankan server Jekyll lokal...'));
      const jekyllCommand = `bundle exec jekyll serve --livereload --port ${options.port}`;
      
      console.log(chalk.yellow('Tekan Ctrl+C untuk menghentikan server\n'));
      const child = exec(jekyllCommand);

      child.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      child.stderr.on('data', (data) => {
        console.error(chalk.yellow(data.toString()));
      });
    }
  });

// Perintah: build
program
  .command('build')
  .description('Bangun situs Jekyll')
  .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
  .action(async (options) => {
    const useDocker = options.docker && await checkDocker();
    
    if (useDocker) {
      console.log(chalk.blue('🐳 Membangun situs dengan Docker...'));
      const projectPath = process.cwd();
      const dockerCommand = `docker run --rm -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll build`;
      await runDockerCommand(dockerCommand, 'Situs berhasil dibangun dengan Docker');
      
    } else {
      if (!await checkJekyll()) {
        console.error(chalk.red('❌ Jekyll tidak ditemukan. Install Jekyll atau gunakan Docker.'));
        return;
      }
      
      console.log(chalk.blue('🚀 Membangun situs dengan Jekyll lokal...'));
      const jekyllCommand = 'bundle exec jekyll build';
      await runDockerCommand(jekyllCommand, 'Situs berhasil dibangun');
    }
    
    console.log(chalk.green('📦 Situs siap di-deploy! File ada di folder _site/'));
  });

// Perintah: doctor
program
  .command('doctor')
  .description('Periksa environment dan dependencies')
  .action(async () => {
    console.log(chalk.blue('🩺 Memeriksa environment...\n'));
    
    const checks = [
      { name: 'Node.js', check: async () => ({ version: process.version, ok: true }) },
      { name: 'Docker', check: async () => {
        try {
          const { stdout } = await execAsync('docker --version');
          return { version: stdout.trim(), ok: true };
        } catch {
          return { version: 'Not installed', ok: false };
        }
      }},
      { name: 'Jekyll', check: async () => {
        try {
          const { stdout } = await execAsync('jekyll --version');
          return { version: stdout.trim(), ok: true };
        } catch {
          return { version: 'Not installed', ok: false };
        }
      }},
      { name: 'API Connection', check: async () => {
        try {
          await axios.get(`${API_BASE_URL}/health`);
          return { version: 'Connected', ok: true };
        } catch {
          return { version: 'Cannot connect', ok: false };
        }
      }}
    ];
    
    for (const check of checks) {
      const result = await check.check();
      const status = result.ok ? chalk.green('✓') : chalk.red('✗');
      console.log(`${status} ${check.name}: ${chalk.cyan(result.version)}`);
    }
    
    console.log(chalk.yellow('\n💡 Tips:'));
    if (!await checkDocker()) {
      console.log('  - Install Docker: https://docs.docker.com/get-docker/');
    }
    if (!await checkJekyll()) {
      console.log('  - Install Jekyll: https://jekyllrb.com/docs/installation/');
    }
  });

// Handle command tidak dikenal
program.showHelpAfterError('(Gunakan --help untuk melihat perintah yang tersedia)');

// Parsing argumen dari terminal
program.parse(process.argv);