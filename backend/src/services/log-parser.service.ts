import { LogEntry, AlertEntry } from '../types';

export class LogParserService {
  /**
   * Parse les logs de backup MySQL
   */
  parseMysqlLogs(logContent: string): LogEntry[] {
    const entries: LogEntry[] = [];
    const lines = logContent.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const entry = this.parseLogLine(line);
      if (entry) {
        entries.push(entry);
      }
    }

    return entries.reverse(); // Plus récent en premier
  }

  /**
   * Parse les logs de backup de fichiers
   */
  parseFilesLogs(logContent: string): LogEntry[] {
    return this.parseMysqlLogs(logContent); // Même format
  }

  /**
   * Parse les logs d'alertes
   */
  parseAlertLogs(logContent: string): AlertEntry[] {
    const entries: AlertEntry[] = [];
    const lines = logContent.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const entry = this.parseAlertLine(line);
      if (entry) {
        entries.push(entry);
      }
    }

    return entries.reverse(); // Plus récent en premier
  }

  /**
   * Parse une ligne de log générique
   */
  private parseLogLine(line: string): LogEntry | null {
    // Format attendu: [TIMESTAMP] LEVEL: message
    // Exemples:
    // [2024-12-10 12:00:00] INFO: Backup MySQL montfreeride started
    // [2024-12-10 12:00:05] ERROR: Failed to backup MySQL
    
    const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
    if (!timestampMatch) {
      // Essayer d'extraire une date au début de la ligne
      const dateMatch = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/);
      if (dateMatch) {
        const timestamp = dateMatch[1].replace(' ', 'T');
        const level = this.detectLogLevel(line);
        const message = line.replace(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[:\s]*/, '').trim();
        
        return {
          timestamp: new Date(timestamp).toISOString(),
          level,
          message: message || line
        };
      }
      
      // Si pas de timestamp, utiliser la date actuelle et le niveau détecté
      const level = this.detectLogLevel(line);
      return {
        timestamp: new Date().toISOString(),
        level,
        message: line.trim()
      };
    }

    const timestamp = timestampMatch[1].replace(' ', 'T');
    const levelMatch = line.match(/\]\s*(INFO|WARNING|ERROR|WARN|ERR):\s*(.+)/i);
    
    let level: 'info' | 'warning' | 'error' = 'info';
    let message = line;

    if (levelMatch) {
      const levelStr = levelMatch[1].toLowerCase();
      if (levelStr.includes('error') || levelStr.includes('err')) {
        level = 'error';
      } else if (levelStr.includes('warning') || levelStr.includes('warn')) {
        level = 'warning';
      }
      message = levelMatch[2].trim();
    } else {
      level = this.detectLogLevel(line);
      message = line.replace(/\[.*?\]\s*/, '').trim();
    }

    return {
      timestamp: new Date(timestamp).toISOString(),
      level,
      message: message || line
    };
  }

  /**
   * Parse une ligne d'alerte
   */
  private parseAlertLine(line: string): AlertEntry | null {
    const logEntry = this.parseLogLine(line);
    if (!logEntry) return null;

    return {
      timestamp: logEntry.timestamp,
      message: logEntry.message,
      type: logEntry.level === 'error' ? 'error' : 'warning'
    };
  }

  /**
   * Détecte le niveau de log à partir du contenu
   */
  private detectLogLevel(line: string): 'info' | 'warning' | 'error' {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('error') || lowerLine.includes('failed') || lowerLine.includes('échec')) {
      return 'error';
    }
    if (lowerLine.includes('warning') || lowerLine.includes('warn') || lowerLine.includes('attention')) {
      return 'warning';
    }
    
    return 'info';
  }

  /**
   * Combine plusieurs sources de logs
   */
  combineLogs(...logArrays: LogEntry[][]): LogEntry[] {
    const combined = logArrays.flat();
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

