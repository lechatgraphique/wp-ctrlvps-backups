import { SSHService } from './ssh.service';
import { BackupListService } from './backup-list.service';
import { LogParserService } from './log-parser.service';

export interface SystemStats {
  cpu: {
    usage: number; // Pourcentage d'utilisation CPU
    cores: number; // Nombre de cœurs
  };
  memory: {
    total: number; // En bytes
    used: number; // En bytes
    free: number; // En bytes
    percentage: number; // Pourcentage utilisé
  };
  disk: {
    total: number; // En bytes
    used: number; // En bytes
    free: number; // En bytes
    percentage: number; // Pourcentage utilisé
  };
}

export interface BackupStats {
  montfreeride: {
    mysql: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
      successRate: number; // Pourcentage de succès
      errorRate: number; // Pourcentage d'erreur
    };
    files: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
      successRate: number;
      errorRate: number;
    };
  };
  oxygenefit: {
    mysql: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
      successRate: number;
      errorRate: number;
    };
    files: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
      successRate: number;
      errorRate: number;
    };
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

export class StatsService {
  constructor(
    private sshService: SSHService,
    private backupListService: BackupListService,
    private logParser: LogParserService
  ) {}

  /**
   * Récupère les statistiques système (CPU, RAM, Disque)
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      // Récupérer les stats CPU
      const cpuCommand = `top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}'`;
      const cpuUsage = await this.sshService.executeCommand(cpuCommand).then(output => {
        const value = parseFloat(output.trim());
        return isNaN(value) ? 0 : Math.round(value);
      }).catch(() => 0);

      const coresCommand = `nproc`;
      const cores = await this.sshService.executeCommand(coresCommand).then(output => {
        return parseInt(output.trim(), 10) || 1;
      }).catch(() => 1);

      // Récupérer les stats mémoire
      const memCommand = `free -b | grep Mem | awk '{print $2" "$3" "$4}'`;
      const memOutput = await this.sshService.executeCommand(memCommand);
      const [totalMem, usedMem, freeMem] = memOutput.trim().split(/\s+/).map(v => parseInt(v, 10) || 0);
      const memPercentage = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

      // Récupérer les stats disque (pour le répertoire de backups)
      const backupDir = process.env.VPS_BACKUP_DIR || '/home/deploy/docker-services/backups';
      const diskCommand = `df -B1 "${backupDir}" | tail -1 | awk '{print $2" "$3" "$4}'`;
      const diskOutput = await this.sshService.executeCommand(diskCommand);
      const [totalDisk, usedDisk, freeDisk] = diskOutput.trim().split(/\s+/).map(v => parseInt(v, 10) || 0);
      const diskPercentage = totalDisk > 0 ? Math.round((usedDisk / totalDisk) * 100) : 0;

      return {
        cpu: {
          usage: cpuUsage,
          cores: cores
        },
        memory: {
          total: totalMem,
          used: usedMem,
          free: freeMem,
          percentage: memPercentage
        },
        disk: {
          total: totalDisk,
          used: usedDisk,
          free: freeDisk,
          percentage: diskPercentage
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats système:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        cpu: { usage: 0, cores: 1 },
        memory: { total: 0, used: 0, free: 0, percentage: 0 },
        disk: { total: 0, used: 0, free: 0, percentage: 0 }
      };
    }
  }

  /**
   * Récupère les statistiques de backups par projet
   */
  async getBackupStats(): Promise<BackupStats> {
    try {
      const backupDir = process.env.VPS_BACKUP_DIR || '/home/deploy/docker-services/backups';
      
      // Récupérer les backups MySQL et fichiers pour chaque projet
      const montfreerideMysql = await this.backupListService.listMysqlBackups('montfreeride');
      const montfreerideFiles = await this.backupListService.listFilesBackups('montfreeride');
      const oxygenefitMysql = await this.backupListService.listMysqlBackups('oxygenefit');
      const oxygenefitFiles = await this.backupListService.listFilesBackups('oxygenefit');

      // Récupérer les logs pour calculer les taux de succès/erreur
      const mysqlLogs = await this.sshService.readFile(`${backupDir}/cron-mysql.log`).catch(() => '');
      const filesLogs = await this.sshService.readFile(`${backupDir}/cron-files.log`).catch(() => '');
      const allLogs = await this.sshService.readFile(`${backupDir}/cron-all.log`).catch(() => '');

      const mysqlEntries = this.logParser.parseMysqlLogs(mysqlLogs);
      const filesEntries = this.logParser.parseFilesLogs(filesLogs);
      const allEntries = this.logParser.parseMysqlLogs(allLogs);
      const combinedLogs = this.logParser.combineLogs(mysqlEntries, filesEntries, allEntries);

      // Calculer les taux de succès/erreur pour chaque projet et type
      const montfreerideMysqlLogs = combinedLogs.filter(log => 
        log.message.toLowerCase().includes('montfreeride') && 
        log.message.toLowerCase().includes('mysql')
      );
      const montfreerideFilesLogs = combinedLogs.filter(log => 
        log.message.toLowerCase().includes('montfreeride') && 
        (log.message.toLowerCase().includes('files') || log.message.toLowerCase().includes('wp-content'))
      );
      const oxygenefitMysqlLogs = combinedLogs.filter(log => 
        log.message.toLowerCase().includes('oxygenefit') && 
        log.message.toLowerCase().includes('mysql')
      );
      const oxygenefitFilesLogs = combinedLogs.filter(log => 
        log.message.toLowerCase().includes('oxygenefit') && 
        (log.message.toLowerCase().includes('files') || log.message.toLowerCase().includes('wp-content'))
      );

      const calculateSuccessRate = (logs: any[]) => {
        if (logs.length === 0) return 100;
        const success = logs.filter(log => log.level !== 'error').length;
        return Math.round((success / logs.length) * 100);
      };

      const calculateErrorRate = (logs: any[]) => {
        if (logs.length === 0) return 0;
        const errors = logs.filter(log => log.level === 'error').length;
        return Math.round((errors / logs.length) * 100);
      };

      // Calculer l'espace disque total utilisé par les backups
      const diskCommand = `du -sb ${backupDir} 2>/dev/null | awk '{print $1}'`;
      const totalBackupSize = await this.sshService.executeCommand(diskCommand).then(output => {
        return parseInt(output.trim(), 10) || 0;
      }).catch(() => 0);

      const diskTotalCommand = `df -B1 "${backupDir}" | tail -1 | awk '{print $2}'`;
      const diskTotal = await this.sshService.executeCommand(diskTotalCommand).then(output => {
        return parseInt(output.trim(), 10) || 0;
      }).catch(() => 0);

      return {
        montfreeride: {
          mysql: {
            count: montfreerideMysql.length,
            lastBackup: montfreerideMysql.length > 0 ? montfreerideMysql[0].date : null,
            totalSize: montfreerideMysql.reduce((sum, b) => sum + b.size, 0),
            successRate: calculateSuccessRate(montfreerideMysqlLogs),
            errorRate: calculateErrorRate(montfreerideMysqlLogs)
          },
          files: {
            count: montfreerideFiles.length,
            lastBackup: montfreerideFiles.length > 0 ? montfreerideFiles[0].date : null,
            totalSize: montfreerideFiles.reduce((sum, b) => sum + b.size, 0),
            successRate: calculateSuccessRate(montfreerideFilesLogs),
            errorRate: calculateErrorRate(montfreerideFilesLogs)
          }
        },
        oxygenefit: {
          mysql: {
            count: oxygenefitMysql.length,
            lastBackup: oxygenefitMysql.length > 0 ? oxygenefitMysql[0].date : null,
            totalSize: oxygenefitMysql.reduce((sum, b) => sum + b.size, 0),
            successRate: calculateSuccessRate(oxygenefitMysqlLogs),
            errorRate: calculateErrorRate(oxygenefitMysqlLogs)
          },
          files: {
            count: oxygenefitFiles.length,
            lastBackup: oxygenefitFiles.length > 0 ? oxygenefitFiles[0].date : null,
            totalSize: oxygenefitFiles.reduce((sum, b) => sum + b.size, 0),
            successRate: calculateSuccessRate(oxygenefitFilesLogs),
            errorRate: calculateErrorRate(oxygenefitFilesLogs)
          }
        },
        diskUsage: {
          used: totalBackupSize,
          total: diskTotal,
          percentage: diskTotal > 0 ? Math.round((totalBackupSize / diskTotal) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats de backups:', error);
      // Retourner des valeurs par défaut
      return {
        montfreeride: {
          mysql: { count: 0, lastBackup: null, totalSize: 0, successRate: 100, errorRate: 0 },
          files: { count: 0, lastBackup: null, totalSize: 0, successRate: 100, errorRate: 0 }
        },
        oxygenefit: {
          mysql: { count: 0, lastBackup: null, totalSize: 0, successRate: 100, errorRate: 0 },
          files: { count: 0, lastBackup: null, totalSize: 0, successRate: 100, errorRate: 0 }
        },
        diskUsage: { used: 0, total: 0, percentage: 0 }
      };
    }
  }
}

