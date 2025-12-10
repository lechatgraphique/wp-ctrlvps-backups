import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackupFile {
  name: string;
  size: number;
  date: string;
  path: string;
}

export interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
}

export interface BackupStats {
  montfreeride: {
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

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface AlertEntry {
  timestamp: string;
  message: string;
  type: 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class BackupApiService {
  private readonly http = inject(HttpClient);
  // Détecter l'environnement : en production, utiliser le chemin relatif pour Traefik
  // En développement local, utiliser localhost
  private readonly apiUrl = this.getApiUrl();

  private getApiUrl(): string {
    // En production (dans Docker), utiliser le chemin relatif pour passer par Traefik
    // En développement local, utiliser localhost
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si on est sur localhost ou 127.0.0.1, utiliser localhost:3000
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
      }
    }
    // Sinon, utiliser le chemin relatif pour passer par Traefik/Nginx
    return '/api';
  }

  getLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/logs`);
  }

  getAlerts(): Observable<AlertEntry[]> {
    return this.http.get<AlertEntry[]>(`${this.apiUrl}/alerts`);
  }

  getMysqlBackups(project: 'montfreeride' | 'oxygenefit'): Observable<BackupFile[]> {
    return this.http.get<BackupFile[]>(`${this.apiUrl}/backups/mysql/${project}`);
  }

  getFilesBackups(project: 'montfreeride' | 'oxygenefit'): Observable<BackupFile[]> {
    return this.http.get<BackupFile[]>(`${this.apiUrl}/backups/files/${project}`);
  }

  getStats(): Observable<BackupStats> {
    return this.http.get<BackupStats>(`${this.apiUrl}/stats/backups`);
  }

  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.apiUrl}/stats/system`);
  }

  restoreMysql(project: 'montfreeride' | 'oxygenefit', backupPath: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/restore/mysql/${project}`,
      { backupPath }
    );
  }

  restoreFiles(project: 'montfreeride' | 'oxygenefit', backupPath: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/restore/files/${project}`,
      { backupPath }
    );
  }

  downloadBackup(backupPath: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backups/download?path=${encodeURIComponent(backupPath)}`, {
      responseType: 'blob'
    });
  }
}

