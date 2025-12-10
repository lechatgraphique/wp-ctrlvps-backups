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
  private readonly apiUrl = 'http://localhost:3000/api'; // À configurer selon l'environnement

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

