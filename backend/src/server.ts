import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SSHService } from './services/ssh.service';
import logsRoutes from './routes/logs.routes';
import alertsRoutes from './routes/alerts.routes';
import backupsRoutes from './routes/backups.routes';
import restoreRoutes from './routes/restore.routes';
import statsRoutes from './routes/stats.routes';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration SSH
const sshConfig = {
  host: process.env.VPS_HOST || 'votre-vps.example.com',
  username: process.env.VPS_USER || 'deploy',
  port: parseInt(process.env.VPS_PORT || '22', 10),
  privateKeyPath: process.env.VPS_PRIVATE_KEY_PATH,
  password: process.env.VPS_PASSWORD,
};

// Initialiser le service SSH
const sshService = new SSHService(sshConfig);
app.set('sshService', sshService);

// Routes
app.use('/api/logs', logsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/backups', backupsRoutes);
app.use('/api/restore', restoreRoutes);
app.use('/api/stats', statsRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gestion des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: err.message 
  });
});

// Démarrer le serveur
async function startServer() {
  try {
    // Se connecter au VPS
    console.log('🔌 Connexion au VPS...');
    await sshService.connect();
    
    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  sshService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  sshService.disconnect();
  process.exit(0);
});

startServer();

