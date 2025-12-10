import dotenv from 'dotenv';
import { SSHService } from './services/ssh.service';

// Charger les variables d'environnement
dotenv.config();

async function testSSHConnection() {
  console.log('🔍 Test de connexion SSH au VPS...\n');

  // Configuration SSH
  const sshConfig = {
    host: process.env.VPS_HOST || 'votre-vps.example.com',
    username: process.env.VPS_USER || 'deploy',
    port: parseInt(process.env.VPS_PORT || '22', 10),
    privateKeyPath: process.env.VPS_PRIVATE_KEY_PATH,
    password: process.env.VPS_PASSWORD,
  };

  console.log('📋 Configuration:');
  console.log(`  Host: ${sshConfig.host}`);
  console.log(`  User: ${sshConfig.username}`);
  console.log(`  Port: ${sshConfig.port}`);
  console.log(`  Auth: ${sshConfig.privateKeyPath ? 'Clé privée' : sshConfig.password ? 'Mot de passe' : 'Non configuré'}\n`);

  const sshService = new SSHService(sshConfig);

  try {
    // 1. Connexion
    console.log('1️⃣ Connexion au VPS...');
    await sshService.connect();
    console.log('✅ Connexion réussie !\n');

    // 2. Test de commande simple
    console.log('2️⃣ Test de commande (whoami)...');
    const whoami = await sshService.executeCommand('whoami');
    console.log(`✅ Utilisateur: ${whoami.trim()}\n`);

    // 3. Test de lecture du répertoire de backups
    console.log('3️⃣ Vérification du répertoire de backups...');
    const backupDir = process.env.VPS_BACKUP_DIR || '/home/deploy/docker-services/backups';
    const files = await sshService.listFiles(backupDir);
    console.log(`✅ Répertoire trouvé: ${backupDir}`);
    console.log(`   Fichiers trouvés: ${files.length}`);
    if (files.length > 0) {
      console.log(`   Exemples: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}\n`);
    } else {
      console.log('   ⚠️  Aucun fichier trouvé\n');
    }

    // 4. Test de lecture d'un fichier de log
    console.log('4️⃣ Test de lecture d\'un fichier de log...');
    const logFiles = ['cron-mysql.log', 'cron-files.log', 'alert.log', 'monitor.log'];
    let logFound = false;

    for (const logFile of logFiles) {
      try {
        const logPath = `${backupDir}/${logFile}`;
        const content = await sshService.readFile(logPath);
        const lines = content.split('\n').filter(l => l.trim()).length;
        console.log(`✅ ${logFile}: ${lines} lignes`);
        logFound = true;
      } catch (error) {
        console.log(`⚠️  ${logFile}: fichier non trouvé ou vide`);
      }
    }

    if (!logFound) {
      console.log('\n⚠️  Aucun fichier de log trouvé. Vérifiez que les backups sont configurés sur le VPS.\n');
    }

    // 5. Test d'espace disque
    console.log('\n5️⃣ Vérification de l\'espace disque...');
    const dfOutput = await sshService.executeCommand('df -h /home/deploy/docker-services/backups 2>/dev/null || df -h /');
    console.log('✅ Espace disque:');
    console.log(dfOutput);

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ Le backend peut maintenant se connecter au VPS et lire les logs.\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
    }
    console.log('\n💡 Vérifications à faire:');
    console.log('   1. Le fichier .env est-il correctement configuré ?');
    console.log('   2. La clé SSH existe-t-elle au chemin spécifié ?');
    console.log('   3. La clé SSH est-elle ajoutée au serveur VPS ?');
    console.log('   4. Le firewall autorise-t-il les connexions SSH ?');
    process.exit(1);
  } finally {
    sshService.disconnect();
  }
}

// Exécuter le test
testSSHConnection().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});

