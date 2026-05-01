import I18n from '../utils/I18n.js';

export default class VueSoumission {
    static rendre() {
        return `
            <div class="soumission-page" style="padding: 60px 4%; animation: fadeIn 0.8s ease-out; max-width: 900px; margin: 0 auto; min-height:80vh;">
                <div style="text-align:center; margin-bottom: 50px;">
                    <h1 style="font-size: 3rem; margin-bottom:15px; color:white;">${I18n.t('sub_title_pre')} <span style="color:var(--primary)">${I18n.t('sub_title_span')}</span></h1>
                    <p style="color:var(--text-muted); font-size:1.2rem; max-width:700px; margin:0 auto; line-height:1.6;">
                        ${I18n.t('sub_tagline')}
                    </p>
                </div>
                
                <div style="background:rgba(25,25,30,0.5); padding:50px; border-radius:8px; border:1px solid #333; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <form id="form-soumission" style="display:flex; flex-direction:column; gap:20px;">
                        
                        <div style="display:flex; gap:20px; flex-wrap:wrap;">
                            <input type="text" placeholder="${I18n.t('sub_placeholder_name')}" style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                            <input type="email" placeholder="${I18n.t('sub_placeholder_email')}" style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                        </div>
                        
                        <input type="text" placeholder="${I18n.t('sub_placeholder_title')}" style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                        
                        <select style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                            <option value="">${I18n.t('sub_opt_genre_placeholder')}</option>
                            <option value="action">${I18n.t('genre_action')}</option>
                            <option value="romance">${I18n.t('genre_romance')}</option>
                            <option value="isekai">${I18n.t('genre_isekai')}</option>
                            <option value="thriller">${I18n.t('genre_thriller')}</option>
                            <option value="scifi">${I18n.t('genre_scifi')}</option>
                        </select>
                        
                        <textarea placeholder="${I18n.t('sub_placeholder_pitch')}" rows="6" style="padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem; resize:vertical; font-family:inherit;" required></textarea>
                        
                        <div style="display:flex; gap:20px; flex-wrap:wrap;">
                            <input type="text" placeholder="${I18n.t('sub_placeholder_socials')}" style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                            <select style="flex:1; min-width:200px; padding:18px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;" required>
                                <option value="">${I18n.t('sub_opt_freq_placeholder')}</option>
                                <option value="hebdo">${I18n.t('freq_weekly')}</option>
                                <option value="bimensuel">${I18n.t('freq_biweekly')}</option>
                                <option value="mensuel">${I18n.t('freq_monthly')}</option>
                                <option value="fini">${I18n.t('freq_finished')}</option>
                            </select>
                        </div>

                        <label style="color:#aaa; font-size:0.9rem; margin-bottom:-10px; margin-top:5px;">${I18n.t('sub_label_cover')}</label>
                        <input type="file" id="soumission-cover" accept="image/png, image/jpeg, image/webp" style="padding:15px; border-radius:4px; border:1px dashed #444; background:#111; color:white; font-size:1rem; cursor:pointer;" required>
                        
                        <label style="color:#aaa; font-size:0.9rem; margin-bottom:-10px; margin-top:5px;">${I18n.t('sub_label_trailer')}</label>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <input type="file" id="soumission-video" accept="video/mp4, video/webm" title="${I18n.t('sub_video_title')}" style="flex:1; padding:15px; border-radius:4px; border:1px dashed #444; background:#111; color:white; font-size:1rem; cursor:pointer;">
                            <input type="url" id="soumission-video-url" placeholder="${I18n.t('sub_placeholder_video_url')}" style="flex:1; padding:15px; border-radius:4px; border:1px solid #444; background:#111; color:white; font-size:1rem;">
                        </div>


                        <!-- SÉLECTEUR MULTI-LANGUES -->
                        <div style="margin-top:5px;">
                            <label style="display:block; color:#aaa; font-size:0.9rem; margin-bottom:12px; font-family:'Outfit',sans-serif;">
                                <span class="material-symbols-outlined" style="font-size:1rem; vertical-align:middle; margin-right:5px; color:var(--primary);">translate</span>
                                Dans quelle(s) langue(s) allez-vous publier cette œuvre ? <span style="color:var(--primary);">*</span>
                            </label>
                            <div id="lang-selector" style="display:flex; gap:12px; flex-wrap:wrap;">
                                <label class="lang-chip" for="lang-fr" style="display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:50px; border:2px solid #444; background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s; user-select:none;">
                                    <input type="checkbox" id="lang-fr" name="langues" value="fr" checked style="display:none;">
                                    <span style="font-size:1.3rem;">🇫🇷</span>
                                    <span style="color:white; font-weight:600; font-family:'Outfit',sans-serif;">Français</span>
                                    <span class="lang-check" style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:var(--primary); opacity:1; transition:opacity 0.2s;">
                                        <span class="material-symbols-outlined" style="font-size:0.8rem; color:white;">check</span>
                                    </span>
                                </label>
                                <label class="lang-chip" for="lang-en" style="display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:50px; border:2px solid #444; background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s; user-select:none;">
                                    <input type="checkbox" id="lang-en" name="langues" value="en" style="display:none;">
                                    <span style="font-size:1.3rem;">🇬🇧</span>
                                    <span style="color:white; font-weight:600; font-family:'Outfit',sans-serif;">English</span>
                                    <span class="lang-check" style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:var(--primary); opacity:0; transition:opacity 0.2s;">
                                        <span class="material-symbols-outlined" style="font-size:0.8rem; color:white;">check</span>
                                    </span>
                                </label>
                                <label class="lang-chip" for="lang-es" style="display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:50px; border:2px solid #444; background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s; user-select:none;">
                                    <input type="checkbox" id="lang-es" name="langues" value="es" style="display:none;">
                                    <span style="font-size:1.3rem;">🇪🇸</span>
                                    <span style="color:white; font-weight:600; font-family:'Outfit',sans-serif;">Español</span>
                                    <span class="lang-check" style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:var(--primary); opacity:0; transition:opacity 0.2s;">
                                        <span class="material-symbols-outlined" style="font-size:0.8rem; color:white;">check</span>
                                    </span>
                                </label>
                                <label class="lang-chip" for="lang-jp" style="display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:50px; border:2px solid #444; background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s; user-select:none;">
                                    <input type="checkbox" id="lang-jp" name="langues" value="jp" style="display:none;">
                                    <span style="font-size:1.3rem;">🇯🇵</span>
                                    <span style="color:white; font-weight:600; font-family:'Outfit',sans-serif;">日本語</span>
                                    <span class="lang-check" style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:var(--primary); opacity:0; transition:opacity 0.2s;">
                                        <span class="material-symbols-outlined" style="font-size:0.8rem; color:white;">check</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- ZONE DRAG & DROP : PLANCHES DU CHAPITRE -->
                        <div id="dropzone-planches" style="border: 2px dashed #555; padding: 40px 20px; text-align: center; border-radius: 8px; background: rgba(0,0,0,0.3); cursor: pointer; transition: all 0.3s; margin-top: 10px;">
                            <span class="material-symbols-outlined" style="font-size: 3rem; color: #666; margin-bottom: 15px;">cloud_upload</span>
                            <h3 style="color: white; font-family: 'Outfit', sans-serif; font-size: 1.2rem; margin-bottom: 5px;">Planches du Chapitre 1 (Glissez-Déposez)</h3>
                            <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 15px;">JPG/PNG autorisés. Redimensionnement automatique à 800px et conversion WebP.</p>
                            <input type="file" id="input-planches" multiple accept="image/jpeg, image/png, image/webp" style="display: none;">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('input-planches').click();" style="pointer-events:none;">Parcourir les fichiers</button>
                        </div>
                        
                        <!-- Miniatures des planches uploadées -->
                        <div id="preview-planches" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;"></div>

                        <div style="background:rgba(229,9,20,0.05); padding:20px; border-radius:8px; border:1px solid rgba(229,9,20,0.3); margin-top:10px;">
                            <h3 style="color:white; margin-bottom:10px; font-size:1.1rem; display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined" style="color:#e50914;">gavel</span> ${I18n.t('sub_legal_title')}</h3>
                            <label style="display:flex; align-items:flex-start; gap:10px; color:#ccc; font-size:0.9rem; margin-bottom:12px; cursor:pointer;">
                                <input type="checkbox" required style="margin-top:4px; accent-color:var(--primary); width:16px; height:16px;">
                                <span><b>${I18n.t('sub_legal_ip_bold')} :</b> ${I18n.t('sub_legal_ip_text')}</span>
                            </label>
                            <label style="display:flex; align-items:flex-start; gap:10px; color:#ccc; font-size:0.9rem; cursor:pointer;">
                                <input type="checkbox" required style="margin-top:4px; accent-color:var(--primary); width:16px; height:16px;">
                                <span><b>${I18n.t('sub_legal_ai_bold')} :</b> ${I18n.t('sub_legal_ai_text')}</span>
                            </label>
                        </div>
                        
                        <button type="submit" class="btn-primary" style="padding:20px; font-size:1.2rem; margin-top:15px; border:none; border-radius:4px; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">${I18n.t('sub_btn_submit')}</button>
                    </form>
                </div>
            </div>
        `;
    }
}
