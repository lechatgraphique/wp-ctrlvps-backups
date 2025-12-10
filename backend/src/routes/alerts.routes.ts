import { Router, Request, Response } from 'express';
import { SSHService } from '../services/ssh.service';
import { LogParserService } from '../services/log-parser.service';
import { AlertEntry } from '../types';

const router = Router();
const logParser = new LogParserService();

/**
 * GET /api/alerts
 * Récupère les alertes de backup
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const sshService = req.app.get('sshService') as SSHService;
    const backupDir = process.env.VPS_BACKUP_DIR || '/home/deploy/docker-services/backups';

    // Lire le fichier d'alertes
    const alertContent = await sshService.readFile(`${backupDir}/alert.log`).catch(() => '');
    const monitorContent = await sshService.readFile(`${backupDir}/monitor.log`).catch(() => '');

    // Parser les alertes
    const alertEntries = logParser.parseAlertLogs(alertContent);
    const monitorEntries = logParser.parseAlertLogs(monitorContent);

    // Combiner et trier
    const combinedAlerts: AlertEntry[] = [...alertEntries, ...monitorEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json(combinedAlerts);
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des alertes',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;

