import I18n from '../utils/I18n.js';

export default class VueAuth {
    static rendreInscription() {
        return `
            <div class="auth-page" style="display:flex; justify-content:center; align-items:center; min-height:90vh; padding:4%; animation:fadeIn 0.5s;">
                <div class="auth-box" style="background: rgba(15,16,20,0.9); padding: 50px; border-radius:8px; border:1px solid #333; max-width:450px; width:100%; box-shadow: 0 15px 50px rgba(0,0,0,0.8); text-align:center;">
                    <h1 style="margin-bottom: 20px; font-size: 2.5rem; text-transform:uppercase;">${I18n.t('auth_signup_title')} <span style="color:var(--primary)">In</span>toon</h1>
                    <p style="color:var(--text-muted); margin-bottom:30px;">${I18n.t('auth_signup_tagline')}</p>
                    
                    <form id="form-inscription" style="display:flex; flex-direction:column; gap:15px;">
                        <input type="text" id="ins-pseudo" placeholder="${I18n.t('auth_label_pseudo')}" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <input type="email" id="ins-email" placeholder="${I18n.t('auth_label_email')}" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <input type="password" id="ins-pass" placeholder="${I18n.t('auth_label_password_secret')}" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <a href="#" onclick="alert('La récupération de mot de passe sera bientôt disponible !'); return false;" style="color:#888; font-size:0.85rem; text-align:right; text-decoration:none; margin-top:-5px;">Mot de passe oublié ?</a>
                        
                        <button type="submit" class="btn-primary" style="padding:16px; font-size:1.1rem; border:none; cursor:pointer; margin-top:20px; text-transform:uppercase; font-weight:800; border-radius:6px;">${I18n.t('auth_btn_signup')}</button>
                    </form>
                    
                    <p style="margin-top:35px; color:#888; font-size:0.95rem;">${I18n.t('auth_already_member')} <a href="/connexion" data-link style="color:white; font-weight:bold; text-decoration:none;">${I18n.t('auth_link_login')}</a></p>
                </div>
            </div>
        `;
    }

    static rendreConnexion() {
        return `
            <div class="auth-page" style="display:flex; justify-content:center; align-items:center; min-height:90vh; padding:4%; animation:fadeIn 0.5s;">
                <div class="auth-box" style="background: rgba(15,16,20,0.9); padding: 50px; border-radius:8px; border:1px solid #333; max-width:450px; width:100%; box-shadow: 0 15px 50px rgba(0,0,0,0.8); text-align:center;">
                    <h1 style="margin-bottom: 20px; font-size: 2.5rem; text-transform:uppercase;">${I18n.t('auth_login_title')}</h1>
                    <p style="color:var(--text-muted); margin-bottom:40px;">${I18n.t('auth_login_tagline')}</p>
                    
                    <form id="form-connexion" style="display:flex; flex-direction:column; gap:15px;">
                        <input type="email" id="log-email" placeholder="${I18n.t('auth_label_email')}" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <input type="password" id="log-pass" placeholder="${I18n.t('auth_label_password')}" style="padding:16px; border-radius:6px; border:none; background:#222; color:white; font-size:1rem; outline:none;" required>
                        <a href="#" onclick="alert('La récupération de mot de passe sera bientôt disponible !'); return false;" style="color:#888; font-size:0.85rem; text-align:right; text-decoration:none; margin-top:-5px;">Mot de passe oublié ?</a>
                        
                        <button type="submit" class="btn-primary" style="padding:16px; font-size:1.1rem; border:none; cursor:pointer; margin-top:20px; text-transform:uppercase; font-weight:800; border-radius:6px;">${I18n.t('auth_btn_login')}</button>
                    </form>
                    
                    <p style="margin-top:35px; color:#888; font-size:0.95rem;">${I18n.t('auth_new_to_studio')} <a href="/inscription" data-link style="color:white; font-weight:bold; text-decoration:none;">${I18n.t('auth_link_signup')}</a></p>
                </div>
            </div>
        `;
    }
}
