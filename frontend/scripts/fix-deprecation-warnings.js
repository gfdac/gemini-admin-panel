#!/usr/bin/env node

/**
 * Script para corrigir warnings de depreciação do Node.js em dependências do React Scripts
 * Este script é executado automaticamente após npm install
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo warnings de depreciação do Node.js...');

// Arquivo do react-dev-utils que precisa ser corrigido
const checkRequiredFilesPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-dev-utils',
  'checkRequiredFiles.js'
);

try {
  if (fs.existsSync(checkRequiredFilesPath)) {
    let content = fs.readFileSync(checkRequiredFilesPath, 'utf8');
    
    // Substituir fs.F_OK por fs.constants.F_OK
    const updatedContent = content.replace(
      /fs\.accessSync\(([^,]+),\s*fs\.F_OK\)/g,
      'fs.accessSync($1, fs.constants.F_OK)'
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(checkRequiredFilesPath, updatedContent);
      console.log('✅ Warning de depreciação fs.F_OK corrigido em react-dev-utils');
    } else {
      console.log('ℹ️  Arquivo react-dev-utils já está corrigido');
    }
  } else {
    console.log('⚠️  Arquivo react-dev-utils não encontrado');
  }
} catch (error) {
  console.error('❌ Erro ao corrigir warnings de depreciação:', error.message);
}

console.log('🎉 Correção de warnings concluída!');
