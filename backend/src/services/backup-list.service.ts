import { SSHService } from './ssh.service';
import { BackupFile } from '../types';

export class BackupListService {
  constructor(private sshService: SSHService) {}

  /**
   * Liste les backups MySQL pour un projet donné
   */
  async listMysqlBackups(project: 'montfreeride' | 'oxygenefit'): Promise<BackupFile[]> {
    const backupDir = process.env.VPS_BACKUP_DIR || '/home/deploy/docker-services/backups';
    const mysqlDir = `${backupDir}/mysql`;
    
    // Utiliser stat pour obtenir des informations précises sur chaque fichier
    const command = `find ${mysqlDir} -name "*${project}*.sql.gz" -type f -exec stat -c "%n|%s|%Y" {} \\; 2>/dev/null | sort -t'|' -k3 -rn`;
    
    try {
      const output = await this.sshService.executeCommand(command);
      return this.parseBackupListWithStat(output);
    } catch (error) {
      console.error(`Erreur lors de la liste des backups MySQL pour ${project}:`, error);
      return [];
    }
  }

  /**
   * Liste les backups de fichiers (wp-content) pour un projet donné
   */
  async listFilesBackups(project: 'montfreeride' | 'oxygenefit'): Promise<BackupFile[]> {
    const backupDir = process.env.VPS_BACKUP_DIR || '/home/deploy/docker-services/backups';
    const filesDir = `${backupDir}/files`;
    
    // Utiliser stat pour obtenir des informations précises sur chaque fichier
    const command = `find ${filesDir} -name "*${project}*.tar.gz" -type f -exec stat -c "%n|%s|%Y" {} \\; 2>/dev/null | sort -t'|' -k3 -rn`;
    
    try {
      const output = await this.sshService.executeCommand(command);
      return this.parseBackupListWithStat(output);
    } catch (error) {
      console.error(`Erreur lors de la liste des backups fichiers pour ${project}:`, error);
      return [];
    }
  }

  /**
   * Parse la sortie de `stat` pour créer une liste de BackupFile
   * Format: filepath|size_bytes|mtime_unix
   */
  private parseBackupListWithStat(output: string): BackupFile[] {
    if (!output || output.trim().length === 0) {
      return [];
    }

    const lines = output.trim().split('\n').filter(line => line.trim().length > 0);
    const backups: BackupFile[] = [];

    for (const line of lines) {
      const parts = line.trim().split('|');
      
      if (parts.length !== 3) continue;

      const filePath = parts[0];
      const sizeStr = parts[1];
      const mtimeStr = parts[2];
      
      // Extraire le nom du fichier
      const fileName = filePath.split('/').pop() || filePath;
      
      // Convertir la taille en bytes
      const size = parseInt(sizeStr, 10) || 0;
      
      // Convertir le timestamp Unix en date ISO
      const mtime = parseInt(mtimeStr, 10);
      const date = mtime > 0 ? new Date(mtime * 1000) : new Date();

      backups.push({
        name: fileName,
        size: size,
        date: date.toISOString(),
        path: filePath
      });
    }

    // Déjà trié par stat, mais on s'assure que c'est bien trié par date décroissante
    return backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

