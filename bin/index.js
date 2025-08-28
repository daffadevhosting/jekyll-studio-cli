#!/usr/bin/env node

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';

// === CONFIGURATION ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// === SERVICES ===
class ConfigService {
  static API_BASE_URL = process.env.JEKYLL_STUDIO_API_URL || 'http://localhost:3000/api';
  
  static getPackageInfo() {
    try {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      return null;
    }
  }
}

class NotificationService {
  static async checkForUpdates() {
    try {
      const packageJson = ConfigService.getPackageInfo();
      if (!packageJson) return;

      const notifier = updateNotifier({
        pkg: packageJson,
        updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
      });

      notifier.notify({ isGlobal: true });
    } catch (error) {
      // Silent fail - don't disturb user with update check errors
    }
  }
}

class UIService {
  static showHeader() {
    console.log(chalk.blue(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║                ${chalk.bold('JEKYLL STUDIO CLI')}                     ║
  ║           ${chalk.yellow('Build Jekyll Sites with AI 🚀')}              ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
    `));
  }

  static handleApiError(error) {
    if (error.response) {
      console.error(chalk.red(`  Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan di server'}`));
      if (error.response.status === 404) {
        console.log(chalk.yellow('  freeUser: Pastikan [Jekyll Studio API](https://github.com/daffadevhosting/jekyll-studio-api) sudah berjalan di http://localhost:3000'));
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('  Tidak dapat terhubung ke Jekyll Studio API'));
      console.log(chalk.yellow('  Pastikan API sudah berjalan: npm run dev (di folder API)'));
      console.log(chalk.yellow('  Atau set environment variable: export JEKYLL_STUDIO_API_URL=<your-api-url>'));
    } else {
      console.error(chalk.red(`  Kesalahan tidak terduga: ${error.message}`));
    }
  }
}

// === UTILITIES ===
import { promisify } from 'util';
import { exec } from 'child_process';
import ora from 'ora';

const execAsync = promisify(exec);

class SystemUtils {
  static async checkCommand(command) {
    try {
      await execAsync(`${command} --version`);
      return true;
    } catch {
      return false;
    }
  }

  static async checkDocker() {
    return this.checkCommand('docker');
  }

  static async checkJekyll() {
    return this.checkCommand('jekyll');
  }

  static async runCommand(command, successMessage = 'Command finished.', cwd = process.cwd()) {
    const spinner = ora(`Running: ${command.split(' ')[0]}...`).start();
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
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
}

// === FILE OPERATIONS ===
import yaml from 'yaml';

class FileGenerator {
  static generateGemfile() {
    return `source "https://rubygems.org"

gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-paginate"
end
`;
  }

  static generateGitignore() {
    return `node_modules/
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
.bundle/
vendor/
Gemfile.lock
*.gem
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`;
  }

  static generateReadme(structure) {
    return `# ${structure.title || 'Jekyll Site'}

${structure.description || 'A Jekyll site generated with Jekyll Studio AI'}

## Getting Started

1. Install dependencies:
   \
   bundle install
   \

2. Serve locally:
   \
   bundle exec jekyll serve --livereload
   \

3. Open in browser: http://localhost:4000
`;
  }
}

class FileManager {
  static async writeStructureToDisk(basePath, structure) {
    const spinner = ora('Membuat struktur file...').start();
    
    try {
      await fs.ensureDir(basePath);

      // Generate basic files
      await Promise.all([
        fs.writeFile(path.join(basePath, 'Gemfile'), FileGenerator.generateGemfile()),
        fs.writeFile(path.join(basePath, '.gitignore'), FileGenerator.generateGitignore()),
        fs.writeFile(path.join(basePath, 'README.md'), FileGenerator.generateReadme(structure))
      ]);

      // Write configuration
      if (structure.config) {
        await fs.writeFile(path.join(basePath, '_config.yml'), yaml.stringify(structure.config));
      }

      // Write layouts
      await this.writeLayouts(basePath, structure.layouts);

      // Write includes
      await this.writeIncludes(basePath, structure.includes);

      // Write posts
      await this.writePosts(basePath, structure.posts);

      // Write pages
      await this.writePages(basePath, structure.pages);

      // Write collections (e.g., products)
      await this.writeCollections(basePath, structure.collections);

      // Write assets
      await this.writeAssets(basePath, structure.assets);

      spinner.succeed('Struktur file berhasil dibuat!');
    } catch (error) {
      spinner.fail('Gagal membuat struktur file');
      throw error;
    }
  }

  static async writeLayouts(basePath, layouts) {
    if (!layouts?.length) return;

    const layoutsDir = path.join(basePath, '_layouts');
    await fs.ensureDir(layoutsDir);
    
    for (const layout of layouts) {
      const filename = layout.name.endsWith('.html') ? layout.name : `${layout.name}.html`;
      await fs.writeFile(path.join(layoutsDir, filename), layout.content);
    }
  }

  static async writeIncludes(basePath, includes) {
    if (!includes?.length) return;

    const includesDir = path.join(basePath, '_includes');
    await fs.ensureDir(includesDir);
    
    for (const include of includes) {
      const filename = include.name.endsWith('.html') ? include.name : `${include.name}.html`;
      await fs.writeFile(path.join(includesDir, filename), include.content);
    }
  }

  static async writePosts(basePath, posts) {
    if (!posts?.length) return;

    const postsDir = path.join(basePath, '_posts');
    await fs.ensureDir(postsDir);
    
    for (const post of posts) {
      const slug = post.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      const filename = `${post.date}-${slug}.md`;
      await fs.writeFile(path.join(postsDir, filename), post.content);
    }
  }

  static async writePages(basePath, pages) {
    if (!pages?.length) return;

    for (const page of pages) {
      const filename = page.name.match(/\.(html|md)$/) ? page.name : `${page.name}.html`;
      await fs.writeFile(path.join(basePath, filename), page.content);
    }
  }

  static async writeAssets(basePath, assets) {
    if (!assets) return;

    const assetsDir = path.join(basePath, 'assets');
    await fs.ensureDir(assetsDir);

    // CSS
    if (assets.css) {
      const cssDir = path.join(assetsDir, 'css');
      await fs.ensureDir(cssDir);
      await fs.writeFile(path.join(cssDir, 'style.css'), assets.css);
    }

    // JavaScript
    if (assets.js) {
      const jsDir = path.join(assetsDir, 'js');
      await fs.ensureDir(jsDir);
      await fs.writeFile(path.join(jsDir, 'script.js'), assets.js || '// JavaScript files will go here');
    }

    // Images directory
    const imagesDir = path.join(assetsDir, 'images');
    await fs.ensureDir(imagesDir);
    await fs.writeFile(path.join(imagesDir, '.gitkeep'), '');
  }

  //[BARU] untuk menangani collections
  static async writeCollections(basePath, collections) {
    if (!collections || typeof collections !== 'object') return;

    for (const [collectionName, items] of Object.entries(collections)) {
      if (!Array.isArray(items) || !items.length) continue;

      const collectionDir = path.join(basePath, `_${collectionName}`);
      await fs.ensureDir(collectionDir);

      for (const item of items) {
        const filename = item.name.match(/\.(html|md)$/) ? item.name : `${item.name}.md`;
        await fs.writeFile(path.join(collectionDir, filename), item.content);
      }
    }
  }
}

// === API SERVICE ===
import axios from 'axios';

class ApiService {
  static async createSite(prompt, options = {}) {
    const response = await axios.post(`${ConfigService.API_BASE_URL}/cli/create`, {
      prompt,
      options: {
        useTailwind: prompt.toLowerCase().includes('tailwind'),
        ...options
      }
    });
    return response.data;
  }

  static async createPost(title, tags = [], categories = []) {
    const response = await axios.post(`${ConfigService.API_BASE_URL}/cli/add/post`, {
      title,
      tags,
      categories
    });
    return response.data;
  }

  static async checkHealth() {
    const response = await axios.get(`${ConfigService.API_BASE_URL}/health`);
    return response.data;
  }
}

// === COMMANDS ===
import inquirer from 'inquirer';

class CreateCommand {
  static async execute(prompt, options) {
    let spinner = ora('🧠 Menghubungi AI untuk merancang situsmu...').start();
    
    try {
      const { structure } = await ApiService.createSite(prompt, options);
      const siteName = options.name || structure.name || 'jekyll-site';
      const sitePath = path.join(process.cwd(), siteName);

      if (await fs.pathExists(sitePath)) {
        spinner.stop(); // Stop spinner sebelum prompt user
        
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Direktori "${siteName}" sudah ada. Timpa?`,
            default: false
          }
        ]);
        
        if (!overwrite) {
          console.log(chalk.yellow('❌ Dibatalkan oleh pengguna.'));
          return;
        }
        
        // Start new spinner untuk penghapusan
        spinner = ora('🗑️  Menghapus direktori lama...').start();
        await fs.remove(sitePath);
        spinner.succeed('Direktori lama dihapus.');
      }

      // Start spinner untuk pembuatan file
      spinner = ora('📁 Membuat struktur file...').start();
      await FileManager.writeStructureToDisk(sitePath, structure);
      
      spinner.succeed(chalk.green('✅ Proyek berhasil dibuat!'));
      
      CreateCommand.showSuccessMessage(siteName, structure);

    } catch (error) {
      if (spinner.isSpinning) {
        spinner.fail(chalk.red('❌ Gagal membuat situs.'));
      }
      UIService.handleApiError(error);
    }
  }

  static showSuccessMessage(siteName, structure) {
    console.log(`
  ${chalk.bold('📁 Lokasi:')} ${chalk.cyan(path.join(process.cwd(), siteName))}
  ${chalk.bold('🏷️  Nama:')} ${chalk.cyan(structure.title)}
  ${chalk.bold('📝 Deskripsi:')} ${chalk.cyan(structure.description)}
  
  ${chalk.bold('Untuk memulai:')}
  ${chalk.cyan(`cd ${siteName}`)}
  ${chalk.cyan('bundle install')}
  ${chalk.cyan('bundle exec jekyll serve --livereload')}
  
  ${chalk.bold('Atau gunakan Docker:')}
  ${chalk.cyan('jekyll-studio serve')}
    `);
  }
}

class AddPostCommand {
  static async execute(title, options) {
    const spinner = ora('✍️  AI sedang menulis postingan untukmu...').start();
    
    try {
      const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
      const categories = options.categories ? options.categories.split(',').map(c => c.trim()) : [];
      
      const { content } = await ApiService.createPost(title, tags, categories);
      
      const date = new Date().toISOString().split('T')[0];
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      const filename = `${date}-${slug}.md`;

      const postsPath = path.join(process.cwd(), '_posts');
      await fs.ensureDir(postsPath);
      await fs.writeFile(path.join(postsPath, filename), content);

      spinner.succeed(chalk.green('✅ Postingan baru berhasil ditambahkan!'));
      console.log(`  ${chalk.bold('📄 File:')} ${chalk.cyan(path.join('_posts', filename))}`);

    } catch (error) {
      spinner.fail(chalk.red('❌ Gagal menambahkan postingan.'));
      UIService.handleApiError(error);
    }
  }
}

class ServeCommand {
  static async execute(options) {
    const useDocker = options.docker && await SystemUtils.checkDocker();
    
    if (useDocker) {
      await ServeCommand.serveWithDocker(options.port);
    } else {
      await ServeCommand.serveWithJekyll(options.port);
    }
  }

  static async serveWithDocker(port) {
    console.log(chalk.blue('🐳 Menjalankan server dengan Docker...'));
    const projectPath = process.cwd();
    const dockerCommand = `docker run --rm -it -p ${port}:4000 -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll serve --livereload --force_polling`;
    
    console.log(chalk.yellow('Tekan Ctrl+C untuk menghentikan server\n'));
    await SystemUtils.runCommand(dockerCommand, 'Server Docker berjalan');
  }

  static async serveWithJekyll(port) {
    if (!await SystemUtils.checkJekyll()) {
      console.error(chalk.red('❌ Jekyll tidak ditemukan. Install Jekyll atau gunakan Docker.'));
      console.log(chalk.cyan('Install Jekyll: https://jekyllrb.com/docs/installation/'));
      console.log(chalk.cyan('Atau gunakan: jekyll-studio serve --no-docker'));
      return;
    }
    
    console.log(chalk.blue('🚀 Menjalankan server Jekyll lokal...'));
    const jekyllCommand = `bundle exec jekyll serve --livereload --port ${port}`;
    
    console.log(chalk.yellow('Tekan Ctrl+C untuk menghentikan server\n'));
    const child = exec(jekyllCommand);

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(chalk.yellow(data.toString()));
    });
  }
}

class BuildCommand {
  static async execute(options) {
    const useDocker = options.docker && await SystemUtils.checkDocker();
    
    if (useDocker) {
      await BuildCommand.buildWithDocker();
    } else {
      await BuildCommand.buildWithJekyll();
    }
    
    console.log(chalk.green('📦 Situs siap di-deploy! File ada di folder _site/'));
  }

  static async buildWithDocker() {
    console.log(chalk.blue('🐳 Membangun situs dengan Docker...'));
    const projectPath = process.cwd();
    const dockerCommand = `docker run --rm -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll build`;
    await SystemUtils.runCommand(dockerCommand, 'Situs berhasil dibangun dengan Docker');
  }

  static async buildWithJekyll() {
    if (!await SystemUtils.checkJekyll()) {
      console.error(chalk.red('❌ Jekyll tidak ditemukan. Install Jekyll atau gunakan Docker.'));
      return;
    }
    
    console.log(chalk.blue('🚀 Membangun situs dengan Jekyll lokal...'));
    const jekyllCommand = 'bundle exec jekyll build';
    await SystemUtils.runCommand(jekyllCommand, 'Situs berhasil dibangun');
  }
}

class DoctorCommand {
  static async execute() {
    console.log(chalk.blue('🩺 Memeriksa environment...\n'));
    
    const checks = [
      {
        name: 'Node.js',
        check: async () => ({ version: process.version, ok: true })
      },
      {
        name: 'Docker',
        check: async () => {
          const isAvailable = await SystemUtils.checkDocker();
          if (isAvailable) {
            const { stdout } = await execAsync('docker --version');
            return { version: stdout.trim(), ok: true };
          }
          return { version: 'Not installed', ok: false };
        }
      },
      {
        name: 'Jekyll',
        check: async () => {
          const isAvailable = await SystemUtils.checkJekyll();
          if (isAvailable) {
            const { stdout } = await execAsync('jekyll --version');
            return { version: stdout.trim(), ok: true };
          }
          return { version: 'Not installed', ok: false };
        }
      },
      {
        name: 'API Connection',
        check: async () => {
          try {
            await ApiService.checkHealth();
            return { version: 'Connected', ok: true };
          } catch {
            return { version: 'Cannot connect', ok: false };
          }
        }
      }
    ];
    
    for (const check of checks) {
      const result = await check.check();
      const status = result.ok ? chalk.green('✓') : chalk.red('✗');
      console.log(`${status} ${check.name}: ${chalk.cyan(result.version)}`);
    }
    
    await DoctorCommand.showTips();
  }

  static async showTips() {
    console.log(chalk.yellow('\n💡 Tips:'));
    if (!await SystemUtils.checkDocker()) {
      console.log('  - Install Docker: https://docs.docker.com/get-docker/');
    }
    if (!await SystemUtils.checkJekyll()) {
      console.log('  - Install Jekyll: https://jekyllrb.com/docs/installation/');
    }
  }
}

// === MAIN PROGRAM ===
function createProgram() {
  const program = new Command();
  const packageJson = ConfigService.getPackageInfo() || { version: '0.0.0' };

  program
    .name('jekyll-studio')
    .description('CLI untuk mengelola situs Jekyll dengan kekuatan AI 🚀')
    .version(packageJson.version)
    .hook('preAction', () => {
      UIService.showHeader();
    });

  // Create command
  program
    .command('create')
    .description('Buat situs Jekyll baru dari prompt AI dan simpan secara lokal.')
    .argument('<prompt>', 'Deskripsi situs yang ingin kamu buat')
    .option('-n, --name <siteName>', 'Tentukan nama direktori untuk situs')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(CreateCommand.execute);

  // Add commands
  const addCommand = program.command('add')
    .description('Tambahkan konten baru ke proyek Jekyll yang ada dengan AI.');

  addCommand
    .command('post')
    .description('Buat postingan blog baru dari sebuah judul.')
    .argument('<title>', 'Judul untuk postingan blog baru')
    .option('--tags <tags>', 'Tags untuk postingan (dipisahkan koma)')
    .option('--categories <categories>', 'Kategori untuk postingan (dipisahkan koma)')
    .action(AddPostCommand.execute);

  // Serve command
  program
    .command('serve')
    .description('Jalankan server pengembangan Jekyll lokal')
    .option('-p, --port <port>', 'Port yang akan digunakan', '4000')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(ServeCommand.execute);

  // Build command
  program
    .command('build')
    .description('Bangun situs Jekyll')
    .option('--no-docker', 'Gunakan Jekyll lokal instead of Docker')
    .action(BuildCommand.execute);

  // Doctor command
  program
    .command('doctor')
    .description('Periksa environment dan dependencies')
    .action(DoctorCommand.execute);

  return program;
}

// === INITIALIZATION ===
function main() {
  // Check for updates
  NotificationService.checkForUpdates().catch(() => {
    // Ignore errors in update check
  });

  // Create and run program
  const program = createProgram();
  
  // Handle unknown commands
  program.showHelpAfterError('(Gunakan --help untuk melihat perintah yang tersedia)');
  
  // Parse arguments
  program.parse(process.argv);
}

// Run the program
main();