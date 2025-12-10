import { Client, ConnectConfig } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

export interface SSHConfig {
  host: string;
  username: string;
  port?: number;
  privateKeyPath?: string;
  password?: string;
}

export class SSHService {
  private client: Client;
  private config: SSHConfig;

  constructor(config: SSHConfig) {
    this.config = config;
    this.client = new Client();
  }

  /**
   * Établit une connexion SSH au VPS
   */
  async connect(): Promise<void> {
    // Résoudre l'adresse IPv4 d'abord pour éviter les problèmes IPv6
    let hostToConnect = this.config.host;
    try {
      const dns = require('dns');
      const { promisify } = require('util');
      const lookup = promisify(dns.lookup);
      const address = await lookup(this.config.host, { family: 4 });
      hostToConnect = address.address;
      console.log(`📍 Résolution DNS IPv4: ${this.config.host} -> ${hostToConnect}`);
    } catch (dnsError) {
      console.warn(`⚠️  Impossible de résoudre IPv4 pour ${this.config.host}, utilisation directe`);
    }

    return new Promise((resolve, reject) => {
      const connectConfig: ConnectConfig = {
        host: hostToConnect,
        username: this.config.username,
        port: this.config.port || 22,
        // Options de connexion pour améliorer la compatibilité
        tryKeyboard: false,
        readyTimeout: 20000, // 20 secondes de timeout
      };

      // Utiliser la clé privée si disponible
      if (this.config.privateKeyPath) {
        // Remplacer ~ par le répertoire home
        let keyPath = this.config.privateKeyPath;
        if (keyPath.startsWith('~')) {
          const homeDir = process.env.HOME || process.env.USERPROFILE || '';
          if (!homeDir) {
            reject(new Error('Impossible de déterminer le répertoire home'));
            return;
          }
          keyPath = keyPath.replace('~', homeDir);
        }
        
        // Résoudre le chemin absolu
        keyPath = path.resolve(keyPath);
        
        try {
          if (!fs.existsSync(keyPath)) {
            reject(new Error(`Clé SSH non trouvée: ${keyPath}`));
            return;
          }
          connectConfig.privateKey = fs.readFileSync(keyPath);
        } catch (error) {
          reject(new Error(`Impossible de lire la clé SSH (${keyPath}): ${error}`));
          return;
        }
      } else if (this.config.password) {
        connectConfig.password = this.config.password;
      } else {
        reject(new Error('Aucune méthode d\'authentification SSH configurée'));
        return;
      }

      this.client.on('ready', () => {
        console.log('✅ Connexion SSH établie');
        resolve();
      });

      this.client.on('error', (err: Error & { level?: string; code?: string }) => {
        let errorMessage = 'Erreur SSH';
        
        if (err.message.includes('Connection lost before handshake')) {
          errorMessage = 'Connexion perdue avant la poignée de main. Vérifiez que:\n' +
            '  - La clé SSH est autorisée sur le serveur\n' +
            '  - Le serveur est accessible (ping, firewall)\n' +
            '  - La clé ne nécessite pas de passphrase (ou configurez-la)';
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
          errorMessage = `Impossible de se connecter au serveur ${this.config.host}. Vérifiez:\n` +
            '  - L\'adresse du serveur est correcte\n' +
            '  - Le port SSH (22) est ouvert\n' +
            '  - Le serveur est en ligne';
        } else if (err.message.includes('Authentication failed')) {
          errorMessage = 'Authentification échouée. Vérifiez:\n' +
            '  - La clé SSH est correcte\n' +
            '  - La clé est autorisée sur le serveur (ssh-copy-id)\n' +
            '  - Les permissions de la clé (chmod 600)';
        }
        
        const enhancedError = new Error(`${errorMessage}\nDétails: ${err.message}`);
        reject(enhancedError);
      });

      this.client.connect(connectConfig);
    });
  }

  /**
   * Exécute une commande sur le serveur distant
   */
  async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.exec(command, (err: Error | undefined, stream: any) => {
        if (err) {
          reject(err);
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('close', (code: number) => {
          if (code !== 0) {
            reject(new Error(`Commande échouée avec le code ${code}: ${stderr}`));
          } else {
            resolve(stdout);
          }
        });

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      });
    });
  }

  /**
   * Lit un fichier sur le serveur distant
   */
  async readFile(filePath: string): Promise<string> {
    const command = `cat "${filePath}"`;
    return this.executeCommand(command);
  }

  /**
   * Liste les fichiers d'un répertoire
   */
  async listFiles(directory: string): Promise<string[]> {
    const command = `ls -1 "${directory}" 2>/dev/null || echo ""`;
    const output = await this.executeCommand(command);
    return output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Obtient les informations d'un fichier (taille, date)
   */
  async getFileInfo(filePath: string): Promise<{ size: number; date: string; exists: boolean }> {
    const command = `stat -c "%s|%Y" "${filePath}" 2>/dev/null || echo "0|0"`;
    const output = await this.executeCommand(command);
    const [sizeStr, mtimeStr] = output.trim().split('|');
    
    return {
      size: parseInt(sizeStr, 10) || 0,
      date: mtimeStr && mtimeStr !== '0' ? new Date(parseInt(mtimeStr, 10) * 1000).toISOString() : '',
      exists: sizeStr !== '0'
    };
  }

  /**
   * Ferme la connexion SSH
   */
  disconnect(): void {
    this.client.end();
    console.log('🔌 Connexion SSH fermée');
  }
}

