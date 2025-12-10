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

export interface BackupFile {
  name: string;
  size: number;
  date: string;
  path: string;
}

export interface BackupStats {
  montfreeride: {
    mysql: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
    };
    files: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
    };
  };
  oxygenefit: {
    mysql: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
    };
    files: {
      count: number;
      lastBackup: string | null;
      totalSize: number;
    };
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

