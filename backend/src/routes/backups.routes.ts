import { Router, Request, Response } from 'express';
import { SSHService } from '../services/ssh.service';
import { BackupListService } from '../services/backup-list.service';
import { BackupFile } from '../types';

const router = Router();

/**
 * GET /api/backups/mysql/:project
 * Liste les backups MySQL pour un projet donné
 */
router.get('/mysql/:project', async (req: Request, res: Response) => {
  try {
    const project = req.params.project as 'montfreeride' | 'oxygenefit';
    
    if (project !== 'montfreeride' && project !== 'oxygenefit') {
      return res.status(400).json({ 
        error: 'Projet invalide',
        message: 'Le projet doit être "montfreeride" ou "oxygenefit"'
      });
    }

    const sshService = req.app.get('sshService') as SSHService;
    const backupListService = new BackupListService(sshService);
    
    const backups = await backupListService.listMysqlBackups(project);
    
    res.json(backups);
  } catch (error) {
    console.error('Erreur lors de la récupération des backups MySQL:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des backups MySQL',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/backups/files/:project
 * Liste les backups de fichiers (wp-content) pour un projet donné
 */
router.get('/files/:project', async (req: Request, res: Response) => {
  try {
    const project = req.params.project as 'montfreeride' | 'oxygenefit';
    
    if (project !== 'montfreeride' && project !== 'oxygenefit') {
      return res.status(400).json({ 
        error: 'Projet invalide',
        message: 'Le projet doit être "montfreeride" ou "oxygenefit"'
      });
    }

    const sshService = req.app.get('sshService') as SSHService;
    const backupListService = new BackupListService(sshService);
    
    const backups = await backupListService.listFilesBackups(project);
    
    res.json(backups);
  } catch (error) {
    console.error('Erreur lors de la récupération des backups fichiers:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des backups fichiers',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;

