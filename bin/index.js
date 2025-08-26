#!/usr/bin/env node

// Import library yang dibutuhkan
import { Command } from 'commander';
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';

// Inisialisasi program commander
const program = new Command();

// Konfigurasi dasar untuk API
const API_BASE_URL = 'http://localhost:3000/api';

program
  .name('jekyll-studio')
  .description('CLI to manage Jekyll sites with the power of AI')
  .version('1.0.0');

// Mendefinisikan perintah "create"
program
  .command('create')
  .description('Create a new Jekyll site from an AI prompt')
  .argument('<prompt>', 'A description of the site you want to create (e.g., "a blog for a coffee shop")')
  .option('-n, --name <siteName>', 'Specify a name for the site directory')
  .action(async (prompt, options) => {
    const spinner = ora('Communicating with the AI to design your site...').start();

    try {
      const payload = {
        prompt: prompt,
        name: options.name,
      };

      // Panggil backend API
      const response = await axios.post(`${API_BASE_URL}/sites/create`, payload);
      
      const { site, buildResult } = response.data;

      if (response.status === 201 && site) {
        spinner.succeed(chalk.green('Site created successfully!'));
        console.log(`
  ✅ ${chalk.bold('ID:')} ${site.id}
  ✅ ${chalk.bold('Name:')} ${site.name}
  ✅ ${chalk.bold('Status:')} ${site.status}
  ✅ ${chalk.bold('Build Time:')} ${buildResult.buildTime}ms
        `);
      } else {
        throw new Error(response.data.error || 'An unknown error occurred.');
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to create site.'));
      if (error.response) {
        console.error(chalk.red(`  Error ${error.response.status}: ${error.response.data.error}`));
      } else {
        console.error(chalk.red(`  An unexpected error occurred: ${error.message}`));
      }
    }
  });

// Tambahkan perintah lain di sini (misalnya list, build, serve)

// Parsing argumen dari terminal
program.parse(process.argv);