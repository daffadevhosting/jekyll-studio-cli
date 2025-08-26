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

// --- Konfigurasi dan Fungsi Bantuan ---

const execAsync = promisify(exec);
const program = new Command();
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fungsi untuk menulis file-file dari struktur JSON ke disk.
 * @param {string} basePath - Path direktori tempat proyek akan dibuat.
 * @param {object} structure - Objek struktur situs dari API.
 */
async function writeStructureToDisk(basePath, structure) {
  await fs.ensureDir(basePath);

  // --- TAMBAHAN BARU: Buat Gemfile ---
  const gemfileContent = `source "https://rubygems.org"\n\ngem "jekyll", "~> 4.3"\n\ngroup :jekyll_plugins do\n  gem "jekyll-feed"\n  gem "jekyll-sitemap"\nend\n`;
  await fs.writeFile(path.join(basePath, 'Gemfile'), gemfileContent);

  // --- TAMBAHAN BARU: Buat .gitignore ---
  const gitignoreContent = `_site/\n.sass-cache/\n.jekyll-cache/\n.jekyll-metadata\n.bundle/\nvendor/\nGemfile.lock\n*.gem\n.DS_Store\n`;
  await fs.writeFile(path.join(basePath, '.gitignore'), gitignoreContent);

  // Tulis file konfigurasi
  if (structure.config) {
    await fs.writeFile(path.join(basePath, '_config.yml'), yaml.stringify(structure.config));
  }

  // Tulis layouts
  if (structure.layouts && structure.layouts.length > 0) {
    const layoutsDir = path.join(basePath, '_layouts');
    await fs.ensureDir(layoutsDir);
    for (const layout of structure.layouts) {
      await fs.writeFile(path.join(layoutsDir, layout.name), layout.content);
    }
  }

  // Tulis includes
  if (structure.includes && structure.includes.length > 0) {
      const includesDir = path.join(basePath, '_includes');
      await fs.ensureDir(includesDir);
      for (const include of structure.includes) {
          await fs.writeFile(path.join(includesDir, include.name), include.content);
      }
  }

  // Tulis posts
  if (structure.posts && structure.posts.length > 0) {
    const postsDir = path.join(basePath, '_posts');
    await fs.ensureDir(postsDir);
    for (const post of structure.posts) {
      const filename = `${post.date}-${post.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      await fs.writeFile(path.join(postsDir, filename), post.content);
    }
  }

  // Tulis pages
  if (structure.pages && structure.pages.length > 0) {
    for (const page of structure.pages) {
      await fs.writeFile(path.join(basePath, page.name), page.content);
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
        await fs.writeFile(path.join(jsDir, 'script.js'), structure.assets.js);
    }
  }
}

/**
 * Menjalankan perintah Docker secara lokal.
 * @param {string} command - Perintah Docker yang akan dijalankan.
 */
async function runDockerCommand(command) {
    const spinner = ora(`Running local command: ${command}...`).start();
    try {
        const { stdout, stderr } = await execAsync(command);
        spinner.succeed('Command finished.');
        if (stdout) console.log(stdout);
        if (stderr) console.error(chalk.yellow(stderr));
    } catch (error) {
        spinner.fail('Command failed.');
        console.error(chalk.red(error.stderr || error.message));
        process.exit(1);
    }
}

// --- Definisi Perintah CLI ---

program
  .name('jekyll-studio')
  .description('CLI untuk mengelola situs Jekyll dengan kekuatan AI 🚀')
  .version('1.2.0'); // Naikkan versi karena ada fitur baru

// Perintah: create
program
  .command('create')
  .description('Buat situs Jekyll baru dari prompt AI dan simpan secara lokal.')
  .argument('<prompt>', 'Deskripsi situs yang ingin kamu buat')
  .option('-n, --name <siteName>', 'Tentukan nama direktori untuk situs')
  .action(async (prompt, options) => {
    const spinner = ora('Menghubungi AI untuk merancang situsmu...').start();
    try {
      const response = await axios.post(`${API_BASE_URL}/cli/create`, { prompt });
      const { structure } = response.data;
      
      const siteName = options.name || structure.name;
      const sitePath = path.join(process.cwd(), siteName);

      spinner.text = 'Struktur diterima! Membuat file secara lokal...';
      await writeStructureToDisk(sitePath, structure);
      
      spinner.succeed(chalk.green('Proyek berhasil dibuat!'));
      console.log(`
  ✅ ${chalk.bold('Lokasi:')} ${sitePath}
  
  Untuk memulai, jalankan perintah berikut:
  ${chalk.cyan(`cd ${siteName}`)}
  ${chalk.cyan(`jekyll-studio serve`)}
      `);
    } catch (error) {
      spinner.fail(chalk.red('Gagal membuat situs.'));
      handleApiError(error);
    }
  });

// Perintah: add
const addCommand = program.command('add').description('Tambahkan konten baru ke proyek Jekyll yang ada dengan AI.');

addCommand
    .command('post')
    .description('Buat postingan blog baru dari sebuah judul.')
    .argument('<title>', 'Judul untuk postingan blog baru')
    .action(async (title) => {
        const spinner = ora('AI sedang menulis postingan untukmu...').start();
        try {
            // Panggil endpoint API yang baru
            const response = await axios.post(`${API_BASE_URL}/cli/add/post`, { title });
            const { content } = response.data;

            // Buat nama file dari judul dan tanggal saat ini
            const date = new Date().toISOString().split('T')[0];
            const filename = `${date}-${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.md`;

            const postsPath = path.join(process.cwd(), '_posts');
            await fs.ensureDir(postsPath);
            await fs.writeFile(path.join(postsPath, filename), content);

            spinner.succeed(chalk.green('Postingan baru berhasil ditambahkan!'));
            console.log(`  ✅ ${chalk.bold('File:')} ${path.join('_posts', filename)}`);

        } catch (error) {
            spinner.fail(chalk.red('Gagal menambahkan postingan.'));
            handleApiError(error);
        }
  });

// Perintah: serve
program
  .command('serve')
  .description('Jalankan server pengembangan Jekyll lokal menggunakan Docker.')
  .option('-p, --port <port>', 'Port yang akan digunakan', '4000')
  .action((options) => {
    console.log(chalk.blue('Mencoba menjalankan server pengembangan Jekyll...'));
    console.log(chalk.yellow('Pastikan Docker sudah berjalan di komputermu.'));
    const projectPath = process.cwd();
    // Ganti 'jekyll-studio-image' dengan nama image Docker Jekyll-mu
    const dockerCommand = `docker run --rm -it -p ${options.port}:4000 -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll serve`;
    runDockerCommand(dockerCommand);
  });

// Perintah: build
program
    .command('build')
    .description('Bangun situs Jekyll secara lokal menggunakan Docker.')
    .action(() => {
        console.log(chalk.blue('Mencoba membangun situs Jekyll...'));
        const projectPath = process.cwd();
        // Ganti 'jekyll-studio-image' dengan nama image Docker Jekyll-mu
        const dockerCommand = `docker run --rm -v "${projectPath}":/srv/jekyll jekyll/jekyll jekyll build`;
        runDockerCommand(dockerCommand);
    });
    
// Fungsi bantuan untuk menangani error API
function handleApiError(error) {
    if (error.response) {
        console.error(chalk.red(`  Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan di server'}`));
    } else {
        console.error(chalk.red(`  Kesalahan tidak terduga: ${error.message}`));
        console.log(chalk.yellow('  Pastikan backend Jekyll Studio API sudah berjalan.'));
    }
}

// Parsing argumen dari terminal
program.parse(process.argv);