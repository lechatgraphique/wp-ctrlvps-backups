import { Router, Request, Response } from 'express';
import { SSHService } from '../services/ssh.service';

const router = Router();

/**
 * POST /api/restore/mysql/:project
 * Restaure un backup MySQL pour un projet donné
 */
router.post('/mysql/:project', async (req: Request, res: Response) => {
  try {
    const project = req.params.project as 'montfreeride' | 'oxygenefit';
    const { backupPath } = req.body;

    if (project !== 'montfreeride' && project !== 'oxygenefit') {
      return res.status(400).json({ 
        success: false,
        error: 'Projet invalide',
        message: 'Le projet doit être "montfreeride" ou "oxygenefit"'
      });
    }

    if (!backupPath || typeof backupPath !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Chemin de backup manquant',
        message: 'Le chemin du backup est requis'
      });
    }

    const sshService = req.app.get('sshService') as SSHService;
    const scriptsDir = process.env.VPS_SCRIPTS_DIR || '/home/deploy/docker-services/scripts';
    const restoreScript = `${scriptsDir}/restore.sh`;

    // Appeler le script de restauration MySQL
    // Format: ./restore.sh <project> mysql <backup_path>
    const command = `bash ${restoreScript} ${project} mysql "${backupPath}"`;

    try {
      const output = await sshService.executeCommand(command);
      
      // Vérifier si la restauration a réussi
      // Le script devrait retourner un code de sortie 0 en cas de succès
      // On peut aussi vérifier la sortie pour des messages d'erreur
      if (output.includes('ERROR') || output.includes('error') || output.includes('failed')) {
        return res.status(500).json({
          success: false,
          message: output || 'Erreur lors de la restauration MySQL'
        });
      }

      res.json({
        success: true,
        message: `Restauration MySQL réussie pour ${project}`
      });
    } catch (error) {
      console.error(`Erreur lors de la restauration MySQL pour ${project}:`, error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la restauration MySQL'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la restauration MySQL:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la restauration MySQL',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/restore/files/:project
 * Restaure un backup de fichiers (wp-content) pour un projet donné
 */
router.post('/files/:project', async (req: Request, res: Response) => {
  try {
    const project = req.params.project as 'montfreeride' | 'oxygenefit';
    const { backupPath } = req.body;

    if (project !== 'montfreeride' && project !== 'oxygenefit') {
      return res.status(400).json({ 
        success: false,
        error: 'Projet invalide',
        message: 'Le projet doit être "montfreeride" ou "oxygenefit"'
      });
    }

    if (!backupPath || typeof backupPath !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Chemin de backup manquant',
        message: 'Le chemin du backup est requis'
      });
    }

    const sshService = req.app.get('sshService') as SSHService;
    const scriptsDir = process.env.VPS_SCRIPTS_DIR || '/home/deploy/docker-services/scripts';
    const restoreScript = `${scriptsDir}/restore.sh`;

    // Appeler le script de restauration de fichiers
    // Format: ./restore.sh <project> files <backup_path>
    const command = `bash ${restoreScript} ${project} files "${backupPath}"`;

    try {
      const output = await sshService.executeCommand(command);
      
      // Vérifier si la restauration a réussi
      if (output.includes('ERROR') || output.includes('error') || output.includes('failed')) {
        return res.status(500).json({
          success: false,
          message: output || 'Erreur lors de la restauration des fichiers'
        });
      }

      res.json({
        success: true,
        message: `Restauration des fichiers réussie pour ${project}`
      });
    } catch (error) {
      console.error(`Erreur lors de la restauration des fichiers pour ${project}:`, error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la restauration des fichiers'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la restauration des fichiers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la restauration des fichiers',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;

