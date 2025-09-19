const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

/**
 * Bir komutun sistemde mevcut olup olmadığını kontrol et
 */
function which(cmd) {
  try {
    return execSync(`which ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/**
 * Komutun versiyonunu al
 */
function getVersion(cmd) {
  try {
    // Önce --version dene
    try {
      const result = execSync(`${cmd} --version`, { 
        encoding: 'utf8', 
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 5000 
      });
      return result.split('\n')[0].trim();
    } catch {
      // --version çalışmazsa -v dene
      try {
        const result = execSync(`${cmd} -v`, { 
          encoding: 'utf8', 
          stdio: ['ignore', 'pipe', 'ignore'],
          timeout: 5000 
        });
        return result.split('\n')[0].trim();
      } catch {
        return '';
      }
    }
  } catch {
    return '';
  }
}

/**
 * MCP sunucularının durumunu kontrol et
 */
function getMCPStatus() {
  try {
    // mcp.config.json dosyasını oku
    const configPath = path.join(process.cwd(), 'mcp.config.json');
    
    if (!fs.existsSync(configPath)) {
      return {
        error: 'mcp.config.json not found',
        servers: []
      };
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const servers = config.servers || [];
    
    return {
      servers: servers.map(server => {
        const command = server.command;
        const bin = which(command);
        const present = !!bin;
        const version = present ? getVersion(command) : '';
        const error = present ? '' : 'not_found';
        
        return {
          name: server.name,
          command: command,
          args: server.args || [],
          description: server.description || '',
          present: present,
          version: version,
          error: error,
          path: bin || null
        };
      }),
      checkedAt: new Date().toISOString(),
      totalServers: servers.length,
      availableServers: servers.filter(s => {
        const bin = which(s.command);
        return !!bin;
      }).length
    };
  } catch (error) {
    return {
      error: error.message,
      servers: [],
      checkedAt: new Date().toISOString()
    };
  }
}

/**
 * MCP sunucusunu test et (opsiyonel)
 */
async function testMCPServer(serverName) {
  try {
    const configPath = path.join(process.cwd(), 'mcp.config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const server = config.servers.find(s => s.name === serverName);
    
    if (!server) {
      return { error: 'Server not found' };
    }
    
    const command = server.command;
    const args = server.args || [];
    
    return new Promise((resolve) => {
      const child = spawn(command, [...args, '--help'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 10000
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({
          name: serverName,
          command: command,
          exitCode: code,
          canExecute: code === 0 || stdout.length > 0,
          stdout: stdout.substring(0, 200), // İlk 200 karakter
          stderr: stderr.substring(0, 200),
          testedAt: new Date().toISOString()
        });
      });
      
      child.on('error', (error) => {
        resolve({
          name: serverName,
          command: command,
          error: error.message,
          canExecute: false,
          testedAt: new Date().toISOString()
        });
      });
      
      // Timeout
      setTimeout(() => {
        child.kill();
        resolve({
          name: serverName,
          command: command,
          error: 'timeout',
          canExecute: false,
          testedAt: new Date().toISOString()
        });
      }, 10000);
    });
  } catch (error) {
    return {
      name: serverName,
      error: error.message,
      canExecute: false,
      testedAt: new Date().toISOString()
    };
  }
}

module.exports = {
  status: getMCPStatus,
  testServer: testMCPServer
};
