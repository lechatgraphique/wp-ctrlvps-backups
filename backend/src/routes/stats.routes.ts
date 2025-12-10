import { Router, Request, Response } from 'express';
import { SSHService } from '../services/ssh.service';
import { StatsService } from '../services/stats.service';
import { BackupListService } from '../services/backup-list.service';
import { LogParserService } from '../services/log-parser.service';

const router = Router();

/**
 * GET /api/stats/system
 * Récupère les statistiques système (CPU, RAM, Disque)
 */
router.get('/system', async (req: Request, res: Response) => {
  try {
    const sshService = req.app.get('sshService') as SSHService;
    const statsService = new StatsService(
      sshService,
      new BackupListService(sshService),
      new LogParserService()
    );
    
    const stats = await statsService.getSystemStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats système:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des stats système',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/stats/backups
 * Récupère les statistiques de backups par projet
 */
router.get('/backups', async (req: Request, res: Response) => {
  try {
    const sshService = req.app.get('sshService') as SSHService;
    const statsService = new StatsService(
      sshService,
      new BackupListService(sshService),
      new LogParserService()
    );
    
    const stats = await statsService.getBackupStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats de backups:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des stats de backups',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;

