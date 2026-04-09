import I18n from '../utils/I18n.js';

export default class VueVip {
    static rendre() {
        return `
            <div class="vip-page" style="padding: 60px 4%; animation: fadeIn 0.8s ease-out; max-width: 1200px; margin: 0 auto; min-height:80vh;">
                <div style="text-align:center; margin-bottom: 60px;">
                    <span class="material-symbols-outlined" style="font-size:4rem; color:#eab308; margin-bottom:15px; text-shadow:0 0 20px rgba(234,179,8,0.5);">stars</span>
                    <h1 style="font-size: 3.5rem; margin-bottom:15px; color:white; font-family:'Outfit', sans-serif;">${I18n.t('vip_title')} <span style="color:#eab308">${I18n.t('vip_title_span')}</span></h1>
                    <p style="color:var(--text-muted); font-size:1.2rem; max-width:700px; margin:0 auto; line-height:1.6;">
                        ${I18n.t('vip_tagline')}
                    </p>
                </div>
                
                <div class="pricing-tiers" style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap; align-items:stretch;">
                    
                    <!-- TIER 1 -->
                    <div style="flex:1; min-width:300px; max-width:380px; background:rgba(25,25,30,0.5); padding:40px; border-radius:12px; border:1px solid #333; display:flex; flex-direction:column; position:relative;">
                        <h2 style="font-size:1.8rem; color:white; margin-bottom:10px;">🌟 ${I18n.t('vip_t1_title')}</h2>
                        <div style="font-size:2.5rem; font-weight:800; color:white; font-family:'Outfit', sans-serif; margin-bottom:20px;">5€<span style="font-size:1rem; color:#aaa; font-weight:normal;">/${I18n.t('month')}</span></div>
                        <p style="color:#aaa; font-size:1rem; margin-bottom:30px;">${I18n.t('vip_t1_tagline')}</p>
                        
                        <ul style="list-style:none; padding:0; margin:0 0 40px 0; color:white; font-size:1.1rem; flex:1;">
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#4ade80;">check_circle</span> ${I18n.t('vip_t1_feat1')}</li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#4ade80;">check_circle</span> ${I18n.t('vip_t1_feat2')}</li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#4ade80;">check_circle</span> ${I18n.t('vip_t1_feat3')}</li>
                        </ul>
                        
                        <a href="#" onclick="alert('Cette section sera bientôt disponible (retour)'); return false;" class="btn-secondary" style="width:100%; border:1px solid white; padding:15px; font-size:1.1rem; text-align:center; display:block; box-sizing:border-box; opacity: 0.7;">${I18n.t('vip_btn_choose')}</a>
                    </div>

                    <!-- TIER 2 -->
                    <div style="flex:1; min-width:300px; max-width:380px; background:rgba(25,25,30,0.5); padding:40px; border-radius:12px; border:1px solid #eab308; display:flex; flex-direction:column; position:relative; box-shadow:0 0 15px rgba(234,179,8,0.1);">
                        <div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); background:#eab308; color:black; font-weight:900; padding:5px 15px; border-radius:30px; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; white-space:nowrap;">${I18n.t('vip_badge_recommended')}</div>
                        <h2 style="font-size:1.8rem; color:white; margin-bottom:10px; margin-top:10px;">👑 ${I18n.t('vip_t2_title')}</h2>
                        <div style="font-size:2.5rem; font-weight:800; color:white; font-family:'Outfit', sans-serif; margin-bottom:20px;">35€<span style="font-size:1rem; color:#aaa; font-weight:normal;">/${I18n.t('month')}</span></div>
                        <p style="color:#aaa; font-size:1rem; margin-bottom:30px;">${I18n.t('vip_t2_tagline')}</p>
                        
                        <ul style="list-style:none; padding:0; margin:0 0 40px 0; color:white; font-size:1.1rem; flex:1;">
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">auto_awesome</span> <b>${I18n.t('vip_t2_feat1')}</b></li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">auto_awesome</span> ${I18n.t('vip_t2_feat2')}</li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">local_shipping</span> <b>${I18n.t('vip_t2_feat3')}</b></li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">auto_awesome</span> ${I18n.t('vip_t2_feat4')}</li>
                        </ul>
                        
                        <a href="#" onclick="alert('Cette section sera bientôt disponible (retour)'); return false;" class="btn-primary" style="width:100%; padding:15px; font-size:1.1rem; text-align:center; display:block; box-sizing:border-box; background:#eab308; color:black; border:none; opacity: 0.7;">${I18n.t('vip_btn_choose')}</a>
                    </div>

                    <!-- TIER 3 -->
                    <div style="flex:1; min-width:300px; max-width:380px; background:rgba(25,25,30,0.5); padding:40px; border-radius:12px; border:2px solid #eab308; display:flex; flex-direction:column; position:relative; box-shadow:0 0 30px rgba(234,179,8,0.2);">
                        <div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); background:#eab308; color:black; font-weight:900; padding:5px 15px; border-radius:30px; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; white-space:nowrap;">Elite 💎</div>
                        <h2 style="font-size:1.8rem; color:white; margin-bottom:10px; margin-top:10px;">🔥 ${I18n.t('vip_t3_title')}</h2>
                        <div style="font-size:2.5rem; font-weight:800; color:white; font-family:'Outfit', sans-serif; margin-bottom:20px;">50€<span style="font-size:1rem; color:#aaa; font-weight:normal;">/${I18n.t('month')}</span></div>
                        <p style="color:#aaa; font-size:1rem; margin-bottom:30px;">${I18n.t('vip_t3_tagline')}</p>
                        
                        <ul style="list-style:none; padding:0; margin:0 0 40px 0; color:white; font-size:1.1rem; flex:1;">
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">local_fire_department</span> <b>${I18n.t('vip_t3_feat1')}</b></li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">star</span> <b>${I18n.t('vip_t3_feat2')}</b></li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">shopping_cart</span> <b>${I18n.t('vip_t3_feat3')}</b></li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">local_fire_department</span> ${I18n.t('vip_t3_feat4')}</li>
                            <li style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span class="material-symbols-outlined" style="color:#eab308;">local_fire_department</span> ${I18n.t('vip_t3_feat5')}</li>
                        </ul>
                        
                        <a href="#" onclick="alert('Cette section sera bientôt disponible (retour)'); return false;" class="btn-primary" style="width:100%; padding:15px; font-size:1.1rem; text-align:center; display:block; box-sizing:border-box; background:#eab308; color:black; border:none; box-shadow:0 10px 20px rgba(0,0,0,0.3); opacity: 0.7;">${I18n.t('vip_btn_choose')}</a>
                    </div>

                </div>
            </div>
        `;
    }
}
