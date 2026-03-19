export default class VueDashboard {
    /**
     * Rendu principal du Dashboard (Espace VIP) de l'utilisateur.
     * @param {Array} projetsFavoris Les favoris
     * @param {Object} utilisateur Les infos de session (pseudo, statut)
     */
    static rendre(projetsFavoris, utilisateur, mesProjets = []) {
        
        // Simuler un historique
        const historiqueHtml = projetsFavoris.length > 0 ? `
            <div class="dashboard-section" style="margin-bottom: 50px;">
                <h2 style="font-size: 1.5rem; margin-bottom: 20px; color: #e5e5e5;">Reprendre la lecture</h2>
                <div class="projet-card" style="max-width:300px;">
                    <a href="/lire/${projetsFavoris[0].id}/chapitre-1" data-link class="projet-link">
                        <img class="projet-cover" src="${projetsFavoris[0].couverture}" alt="${projetsFavoris[0].titre}">
                        <div class="projet-info">
                            <h3 style="color:var(--primary); font-size: 1.2rem; font-weight:800;">▶ Continuer - Chapitre 1</h3>
                            <p style="font-size:0.9rem; color:#d0d0d0; margin-top:5px;">${projetsFavoris[0].titre}</p>
                        </div>
                    </a>
                </div>
            </div>
        ` : `<div style="margin-bottom:50px; background:rgba(255,255,255,0.05); padding:20px; border-radius:8px;"><p style="color:#aaa;">Vous n'avez aucune lecture en cours.</p></div>`;


        return `
            <div class="dashboard-page" style="padding: 40px 4%; animation: fadeIn 0.5s ease-out; min-height: 80vh;">
                
                <!-- En-tête personnalisé -->
                <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 40px;">
                    <div>
                        <h1 style="font-size: 3rem; margin-bottom: 5px;">Votre Espace <span style="color:var(--primary);">VIP</span></h1>
                        <p style="color:var(--text-muted); font-size:1.1rem; font-weight:300;">Bienvenue sur INTOON STUDIOS, <strong style="color:white;">${utilisateur.pseudo}</strong>.</p>
                    </div>
                    <div style="text-align:right;">
                        <span class="badge" style="background:var(--primary); color:white; padding:8px 15px; border-radius:3px; font-weight:bold; font-size:0.9rem;">Statut ${utilisateur.statut} Sécurisé</span>
                    </div>
                </div>
                
                <!-- Corps... -->
                <div class="dashboard-content" style="display:flex; gap: 50px; flex-wrap:wrap;">
                    <div class="dashboard-main" style="flex: 2; min-width:300px;">
                        ${mesProjets.length > 0 ? `
                        <div class="dashboard-section" style="margin-bottom: 50px; background:rgba(255,255,255,0.02); padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                            <h2 style="font-size: 1.5rem; margin-bottom: 25px; color: var(--primary); display:flex; align-items:center; gap:10px;"><span class="material-symbols-outlined">movie_creation</span> Fiches de Production (Mes Œuvres)</h2>
                            <div class="catalogue-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); padding:0;">
                                ${mesProjets.map(p => `
                                    <div class="projet-card" style="box-shadow:0 4px 15px rgba(0,0,0,0.5);">
                                        <img class="projet-cover" src="${p.couverture}" alt="${p.titre}">
                                        <div class="projet-info" style="transform:none; opacity:1; background:linear-gradient(to top, rgba(0,0,0,0.95), transparent); padding:10px;">
                                            <h3 style="font-size:1rem; margin-bottom:5px;">${p.titre}</h3>
                                            <p style="color:${p.statut === 'publie' ? '#22c55e' : p.statut === 'banni' ? '#ef4444' : '#f59e0b'}; font-weight:bold; font-size:0.75rem; text-transform:uppercase; margin-bottom:10px;">${p.statut}</p>
                                            <button class="btn-primary btn-edit-crew" data-id="${p.id}" style="padding:6px 0; font-size:0.8rem; width:100%; border-radius:4px; margin-bottom:5px;">Gérer le Cast & Crew</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${historiqueHtml}
                    </div>

                    <div class="dashboard-sidebar" style="flex: 1; min-width:250px; background: rgba(15,16,20,0.8); border: 1px solid #333; padding:30px; border-radius:8px;">
                        <h3 style="margin-bottom: 25px; border-bottom:1px solid #333; padding-bottom:15px; font-size:1.2rem;">Paramètres du Compte</h3>
                        
                        ${utilisateur.role === 'admin' ? `
                        <div style="background:rgba(229,9,20,0.1); border:1px solid var(--primary); padding:18px; border-radius:8px; margin-bottom:25px;">
                            <h4 style="color:var(--primary); margin-bottom:10px; font-size:1.1rem; text-transform:uppercase; letter-spacing:1px;">⚡ Accès Super Admin</h4>
                            <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px; line-height:1.4;">Vous avez les droits de modification étendus sur le catalogue global.</p>
                            <a href="/admin" data-link class="btn-primary" style="display:block; text-align:center; padding:12px; border-radius:4px; font-weight:bold;">Ouvrir le Back-Office Edge</a>
                        </div>
                        ` : ''}

                        <ul style="list-style:none; display:flex; flex-direction:column; gap:18px;">
                            <li><a href="/favoris" data-link style="color:white; text-decoration:none; display:flex; justify-content:space-between;"><span>⭐ Ma Liste (Favoris)</span> <span style="color:#666;">›</span></a></li>
                            <li><hr style="border-color:#333; margin: 15px 0;"></li>
                            <!-- Bouton déconnexion écouté par app.js -->
                            <li><a href="#" class="btn-logout" style="color:var(--primary); text-decoration:none; font-weight:bold; font-size:1.1rem;">Se déconnecter (Simulation)</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}
