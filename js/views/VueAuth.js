export default class VueAuth {
    static rendreInscription() {
        return `
            <div class="auth-page" style="display:flex; justify-content:center; align-items:center; min-height:90vh; padding:4%; animation:fadeIn 0.5s;">
                <div class="auth-box" style="background: rgba(15,16,20,0.9); padding: 50px; border-radius:8px; border:1px solid #333; max-width:450px; width:100%; box-shadow: 0 15px 50px rgba(0,0,0,0.8); text-align:center;">
                    <h1 style="margin-bottom: 20px; font-size: 2.5rem; text-transform:uppercase;">Rejoindre <span style="color:var(--primary)">In</span>toon</h1>
                    <p style="color:var(--text-muted); margin-bottom:30px;">Débloquez l'accès illimité à tous nos webtoons et soutenez les auteurs indépendants.</p>
                    
                    <form id="form-inscription" style="display:flex; flex-direction:column; gap:15px;">
                        <input type="text" id="ins-pseudo" placeholder="Nom de l'Avatar" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <input type="email" id="ins-email" placeholder="Adresse e-mail" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <input type="password" id="ins-pass" placeholder="Mot de passe secret" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        
                        <button type="submit" class="btn-primary" style="padding:16px; font-size:1.1rem; border:none; cursor:pointer; margin-top:20px; text-transform:uppercase; font-weight:800; border-radius:6px;">Créer mon compte VIP</button>
                    </form>
                    
                    <p style="margin-top:35px; color:#888; font-size:0.95rem;">Vous êtes déjà membre Premium ? <a href="/connexion" data-link style="color:white; font-weight:bold; text-decoration:none;">Identifiez-vous.</a></p>
                </div>
            </div>
        `;
    }

    static rendreConnexion() {
        return `
            <div class="auth-page" style="display:flex; justify-content:center; align-items:center; min-height:90vh; padding:4%; animation:fadeIn 0.5s;">
                <div class="auth-box" style="background: rgba(15,16,20,0.9); padding: 50px; border-radius:8px; border:1px solid #333; max-width:450px; width:100%; box-shadow: 0 15px 50px rgba(0,0,0,0.8); text-align:center;">
                    <h1 style="margin-bottom: 20px; font-size: 2.5rem; text-transform:uppercase;">Connexion</h1>
                    <p style="color:var(--text-muted); margin-bottom:40px;">Ravi de vous revoir. Poursuivez votre lecture.</p>
                    
                    <form id="form-connexion" style="display:flex; flex-direction:column; gap:15px;">
                        <input type="email" id="log-email" placeholder="E-mail (Essayez : superadmin@intoon.com)" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <input type="password" id="log-pass" placeholder="Mot de passe (Essayez : admin123)" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        
                        <button type="submit" class="btn-primary" style="padding:16px; font-size:1.1rem; border:none; cursor:pointer; margin-top:20px; text-transform:uppercase; font-weight:800; border-radius:6px;">Entrer</button>
                    </form>
                    
                    <p style="margin-top:35px; color:#888; font-size:0.95rem;">Premier voyage sur le Studio ? <a href="/inscription" data-link style="color:white; font-weight:bold; text-decoration:none;">Inscrivez-vous ici.</a></p>
                </div>
            </div>
        `;
    }
}
