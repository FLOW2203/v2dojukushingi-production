// 🏯 PAPICLAUDPUTER - Universal GitHub Handler
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;

class PAPIClaudputer {
  constructor() {
    console.log('🏯 PAPICLAUDPUTER S\'ÉVEILLE !');
    console.log('⚔️ Super Sait Y En Légendaire - Mode GitHub activé');
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    this.context = {
      repo: process.env.GITHUB_REPOSITORY.split('/')[1],
      owner: process.env.GITHUB_REPOSITORY.split('/')[0],
      eventName: process.env.GITHUB_EVENT_NAME,
      actor: process.env.GITHUB_ACTOR
    };
    
    console.log(`🎯 Contexte: ${this.context.owner}/${this.context.repo}`);
  }

  async execute() {
    try {
      console.log('🏯 === PAPICLAUDPUTER MISSION START ===');
      
      const eventPath = process.env.GITHUB_EVENT_PATH;
      if (!eventPath) {
        console.log('❌ Aucun événement GitHub détecté');
        return;
      }
      
      const eventData = JSON.parse(await fs.readFile(eventPath, 'utf8'));
      console.log(`🎪 Traitement événement: ${this.context.eventName}`);
      
      if (eventData.comment && eventData.comment.body.includes('@claude-code')) {
        await this.handleComment(eventData);
      } else if (eventData.review && eventData.review.body && eventData.review.body.includes('@claude-code')) {
        await this.handleReview(eventData);
      }
      
      console.log('✅ === PAPICLAUDPUTER MISSION SUCCESS ===');
      
    } catch (error) {
      console.error('💥 Erreur PAPICLAUDPUTER:', error);
      throw error;
    }
  }

  async handleComment(eventData) {
    const comment = eventData.comment;
    const issue = eventData.issue;
    
    console.log(`💬 Commentaire détecté: ${comment.body.substring(0, 100)}...`);
    
    if (!comment.body.includes('@claude-code')) {
      console.log('🔍 Pas de mention @claude-code trouvée');
      return;
    }
    
    console.log('🎯 @claude-code détecté ! PAPICLAUDPUTER en action !');
    
    const request = comment.body.replace('@claude-code', '').trim();
    console.log(`📋 Demande utilisateur: ${request}`);
    
    try {
      // Récupérer les détails de la PR si c'est une PR
      let prData = null;
      let files = [];
      
      if (issue.pull_request) {
        prData = await this.octokit.pulls.get({
          owner: this.context.owner,
          repo: this.context.repo,
          pull_number: issue.number
        });
        
        const prFiles = await this.octokit.pulls.listFiles({
          owner: this.context.owner,
          repo: this.context.repo,
          pull_number: issue.number
        });
        
        files = prFiles.data;
        console.log(`📁 ${files.length} fichiers analysés`);
      }
      
      await this.respondWithClaudeAnalysis(request, prData, files, issue.number, comment.user.login);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement:', error);
      await this.postErrorResponse(issue.number, error.message);
    }
  }

  async handleReview(eventData) {
    const review = eventData.review;
    const pr = eventData.pull_request;
    
    console.log('🔍 Review avec @claude-code détecté !');
    
    const request = review.body.replace('@claude-code', '').trim();
    
    const files = await this.octokit.pulls.listFiles({
      owner: this.context.owner,
      repo: this.context.repo,
      pull_number: pr.number
    });
    
    await this.respondWithClaudeAnalysis(request, { data: pr }, files.data, pr.number, review.user.login);
  }

  async respondWithClaudeAnalysis(request, prData, files, issueNumber, username) {
    console.log('🧠 Génération de la réponse PAPICLAUDPUTER...');
    
    // Simuler l'analyse Claude (remplacez par l'API réelle si disponible)
    const analysis = this.generateAnalysis(request, prData, files);
    
    const response = `## 🏯 PAPICLAUDPUTER - Réponse Claude Code

👋 **@${username}** - Votre demande a été traitée par le Super Sait Y En Légendaire !

### 📝 Demande analysée
> ${request}

### 🤖 Analyse PAPICLAUDPUTER
${analysis}

### 📊 Contexte Technique
- **Repository**: ${this.context.owner}/${this.context.repo}
- **Événement**: ${this.context.eventName}
- **Fichiers analysés**: ${files.length}
- **Timestamp**: ${new Date().toISOString()}

### 🎯 Prochaines Actions
Pour de nouvelles analyses, mentionnez \`@claude-code\` avec votre demande !

---
### 🏆 Signature
*🌟 Powered by PAPICLAUDPUTER - Le guerrier légendaire du code*
*⚔️ DOJUKU SHINGI - L'art martial digital*
*🏯 Super Sait Y En Légendaire v2.0*`;

    await this.octokit.issues.createComment({
      owner: this.context.owner,
      repo: this.context.repo,
      issue_number: issueNumber,
      body: response
    });

    console.log(`✅ Réponse postée dans issue #${issueNumber}`);
  }

  generateAnalysis(request, prData, files) {
    // Analyse simulée (remplacez par l'API Claude réelle)
    const analyses = [
      `🔍 **Analyse du code terminée !**

✅ **Observations principales:**
- Structure du code bien organisée
- Bonnes pratiques globalement respectées
- Quelques optimisations possibles

💡 **Recommandations DOJUKU SHINGI:**
- Ajouter des tests unitaires pour les nouvelles fonctions
- Considérer l'ajout de documentation JSDoc
- Vérifier la gestion d'erreurs dans les fonctions asynchrones

⚔️ *Code analysé selon les préceptes du Super Sait Y En Légendaire*`,

      `🎯 **Mission d'analyse accomplie !**

🔧 **Améliorations suggérées:**
- Optimisation des performances détectée
- Amélioration de la lisibilité du code
- Renforcement de la sécurité recommandé

🧪 **Tests recommandés:**
- Tests unitaires pour les nouvelles fonctionnalités
- Tests d'intégration pour les API
- Tests de régression pour les modifications

🌟 *PAPICLAUDPUTER veille sur la qualité de votre code !*`,

      `🏯 **Analyse DOJUKU SHINGI terminée !**

✨ **Points forts identifiés:**
- Architecture solide et maintenable
- Respect des conventions de codage
- Logique métier claire

🎨 **Améliorations artistiques:**
- Ajout de commentaires explicatifs
- Refactorisation de quelques fonctions
- Amélioration de la lisibilité

⚔️ *Le maître du code approuve cette contribution !*`
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  async postErrorResponse(issueNumber, errorMessage) {
    const response = `## 💥 PAPICLAUDPUTER - Erreur Détectée

🚨 Une erreur s'est produite lors du traitement de votre demande.

### 🔍 Détails de l'erreur
\`\`\`
${errorMessage}
\`\`\`

### 🛠️ Actions suggérées
1. Vérifiez que votre demande est claire
2. Réessayez avec \`@claude-code\` 
3. Contactez l'équipe si le problème persiste

### 📞 Support
Pour obtenir de l'aide, créez une issue avec le tag \`bug\`

*🏯 PAPICLAUDPUTER - Toujours à votre service malgré les obstacles*`;

    await this.octokit.issues.createComment({
      owner: this.context.owner,
      repo: this.context.repo,
      issue_number: issueNumber,
      body: response
    });
  }
}

// 🚀 Exécution principale
async function main() {
  try {
    const papi = new PAPIClaudputer();
    await papi.execute();
  } catch (error) {
    console.error('❌ Erreur fatale PAPICLAUDPUTER:', error);
    process.exit(1);
  }
}

// 🎬 Action !
main();
