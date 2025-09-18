#!/usr/bin/env node

/**
 * Model Retag Script
 * Updates model names across the repository to use new naming conventions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Model mapping for retagging
const MODEL_MAPPINGS = {
  // Claude models
  'claude-3-5-sonnet': 'claude-opus-4.1-pro',
  'claude-3.5-sonnet': 'claude-opus-4.1-pro',
  'claude_3_5_sonnet': 'claude-opus-4.1-pro',
  'claude-3-sonnet': 'claude-opus-4.1-pro',
  'claude-sonnet': 'claude-opus-4.1-pro',
  
  // GPT models
  'gpt-4': 'gpt-5-pro',
  'gpt-4o': 'gpt-5-pro',
  'gpt-4-turbo': 'gpt-5-pro',
  'gpt-4o-mini': 'gpt-5-pro',
  
  // Gemini models
  'gemini-1.5-pro': 'gemini-2.5-pro',
  'gemini-1-5-pro': 'gemini-2.5-pro',
  'gemini-pro': 'gemini-2.5-pro',
  
  // Copilot models
  'copilot-models:gpt-4o': 'copilot-pro:gpt-4o-mini',
  'copilot:gpt-4o': 'copilot-pro:gpt-4o-mini',
  'copilot-gpt-4o': 'copilot-pro:gpt-4o-mini'
};

function findJsonFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function retagFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Apply model mappings
    for (const [oldModel, newModel] of Object.entries(MODEL_MAPPINGS)) {
      const regex = new RegExp(oldModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, newModel);
        hasChanges = true;
        console.log(`  ✓ ${oldModel} → ${newModel}`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🏷️  [RETAG] Starting model retagging process...\n');
  
  const rootDir = process.cwd();
  const jsonFiles = findJsonFiles(rootDir);
  
  console.log(`📁 Found ${jsonFiles.length} JSON files to process\n`);
  
  let processedCount = 0;
  let updatedCount = 0;
  
  for (const file of jsonFiles) {
    const relativePath = path.relative(rootDir, file);
    console.log(`🔍 Processing: ${relativePath}`);
    
    const wasUpdated = retagFile(file);
    processedCount++;
    
    if (wasUpdated) {
      updatedCount++;
      console.log(`  ✅ Updated`);
    } else {
      console.log(`  ⏭️  No changes needed`);
    }
    
    console.log('');
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Skipped: ${processedCount - updatedCount} files`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Model retagging completed successfully!');
  } else {
    console.log('\n✨ All files already up to date!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { retagFile, MODEL_MAPPINGS };
