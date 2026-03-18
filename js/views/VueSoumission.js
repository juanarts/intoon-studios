export default class VueSoumission {
    static rendre() {
        return `
            <div class="soumission-page" style="padding: 60px 4%; animation: fadeIn 0.8s ease-out; max-width: 900px; margin: 0 auto; min-height:80vh;">
                <div style="text-align:center; margin-bottom: 50px;">
                    <h1 style="font-size: 3rem; margin-bottom:15px; color:white;">Rejoignez l'Aventure <span style="color:var(--primary)">INTOON</span></h1>
                    <p style="color:var(--text-muted); font-size:1.2rem; max-width:700px; margin:0 auto; line-height:1.6;">
                        Vous êtes un studio, un scénariste ou un créateur indépendant de Webtoon ?<br>
                        Diffusez vos séries sur notre plateforme premium, atteignez des milliers de lecteurs de la communauté et sécurisez vos revenus !
                    </p>
                </div>
                
                <div style="background:rgba(25,25,30,0.5); padding:50px; border-radius:8px; border:1px solid #333; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <form id="form-soumission" style="display:flex; flex-direction:column; gap:20px;">
                        
                        <div style="display:flex; gap:20px; flex-wrap:wrap;">
                            <input type="text" placeholder="Votre Nom / Nom du Studio" style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                            <input type="email" placeholder="E-mail de contact" style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                        </div>
                        
                        <input type="text" placeholder="Titre complet de la Série Webtoon" style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                        
                        <select style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                            <option value="">Sélectionnez le Genre Principal...</option>
                            <option value="action">Action / Shonen / Arts Martiaux</option>
                            <option value="romance">Romance / Shojo / Drame</option>
                            <option value="isekai">Isekai / Fantasy / Réincarnation</option>
                            <option value="thriller">Horreur / Thriller Suspens</option>
                            <option value="scifi">Cyberpunk / SF</option>
                        </select>
                        
                        <textarea placeholder="Le Pitch de votre histoire (Donnez-nous envie !)" rows="6" style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem; resize:vertical; font-family:inherit;" required></textarea>
                        
                        <div style="display:flex; gap:20px; flex-wrap:wrap;">
                            <input type="text" placeholder="Vos Réseaux (Insta, X, Portfolio...)" style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                            <select style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                                <option value="">Fréquence de Parution Prévue...</option>
                                <option value="hebdo">Hebdomadaire (1 Chap/Semaine)</option>
                                <option value="bimensuel">Bimensuel (2x par Mois)</option>
                                <option value="mensuel">Mensuel (1x par Mois)</option>
                                <option value="fini">Série Terminée (Upload Global)</option>
                            </select>
                        </div>

                        <label style="color:#aaa; font-size:0.9rem; margin-bottom:-10px; margin-top:5px;">Affiche Officielle de votre Série</label>
                        <input type="file" id="soumission-cover" accept="image/png, image/jpeg, image/webp" style="padding:15px; border-radius:4px; border:1px dashed #444; background:#111; color:white; font-size:1rem; cursor:pointer;" required>
                        
                        <label style="color:#aaa; font-size:0.9rem; margin-bottom:-10px; margin-top:5px;">Bande Annonce / Trailer (Optionnel)</label>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <input type="file" id="soumission-video" accept="video/mp4, video/webm" title="Upload Vidéo (Format MP4, max 20 Mo)" style="flex:1; padding:15px; border-radius:4px; border:1px dashed #444; background:#111; color:white; font-size:1rem; cursor:pointer;">
                            <input type="url" id="soumission-video-url" placeholder="Ou Coller un lien YouTube / Vimeo..." style="flex:1; padding:15px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;">
                        </div>

                        <input type="url" placeholder="Lien vers vos planches ! (Google Drive, ArtStation, PDF...)" style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem; margin-top:10px;" required>
                        
                        <div style="background:rgba(229,9,20,0.05); padding:20px; border-radius:8px; border:1px solid rgba(229,9,20,0.3); margin-top:10px;">
                            <h3 style="color:white; margin-bottom:10px; font-size:1.1rem; display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined" style="color:#e50914;">gavel</span> Chartes Légales & Artistiques</h3>
                            <label style="display:flex; align-items:flex-start; gap:10px; color:#ccc; font-size:0.9rem; margin-bottom:12px; cursor:pointer;">
                                <input type="checkbox" required style="margin-top:4px; accent-color:var(--primary); width:16px; height:16px;">
                                <span><b>Propriété Intellectuelle :</b> Je certifie posséder 100% des droits de création et d'exploitation sur les personnages et le scénario de cette œuvre. En cas de plagiat, le compte sera banni.</span>
                            </label>
                            <label style="display:flex; align-items:flex-start; gap:10px; color:#ccc; font-size:0.9rem; cursor:pointer;">
                                <input type="checkbox" required style="margin-top:4px; accent-color:var(--primary); width:16px; height:16px;">
                                <span><b>Strictement Anti-IA brute :</b> J'atteste que cette BD n'a <u>pas été générée artificiellement à 100%</u>. Intoole exige une véritable base de dessin humain. (L'assistance colorimétrique IA est tolérée, mais le prompt pur est interdit).</span>
                            </label>
                        </div>
                        
                        <button type="submit" class="btn-primary" style="padding:20px; font-size:1.2rem; margin-top:15px; border:none; border-radius:4px; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">Envoyer ma candidature 🔥</button>
                    </form>
                </div>
            </div>
        `;
    }
}
