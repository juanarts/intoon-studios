import Messagerie from '../models/Messagerie.js';
import I18n from '../utils/I18n.js';

export default class VueMessagerie {
    static formaterHeure(dateString) {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    static rendre(conversations, activeConv = null) {
        
        const listeHtml = conversations.map(c => `
            <div class="conv-item ${activeConv && activeConv.id === c.id ? 'active' : ''}" data-id="${c.id}" style="display:flex; align-items:center; gap:15px; padding:15px; border-bottom:1px solid #222; cursor:pointer; background:${activeConv && activeConv.id === c.id ? '#1a1a20' : 'transparent'}; transition:background 0.2s;">
                <a href="/profil/${c.idUtilisateur}" data-link title="${I18n.t('msg_view__profile')}" style="flex-shrink:0;">
                    <img src="${c.avatar}" alt="Avatar" style="width:50px; height:50px; border-radius:50%; background:#222; object-fit:cover; border:2px solid transparent; transition:border 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='transparent'">
                </a>
                <div style="flex:1; overflow:hidden;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <a href="/profil/${c.idUtilisateur}" data-link style="font-weight:bold; color:white; font-size:1.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='white'">${c.interlocuteur}</a>
                        <span style="font-size:0.8rem; color:#666;">${this.formaterHeure(c.derniereActivite)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:${c.nonLus > 0 ? 'white' : '#888'}; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;">
                            ${c.messages[c.messages.length - 1].texte}
                        </span>
                        ${c.nonLus > 0 ? `<span style="background:var(--primary); color:white; font-size:0.75rem; font-weight:bold; padding:2px 8px; border-radius:12px;">${c.nonLus}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        let chatHtml = `<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; color:#555;">
                            <span class="material-symbols-outlined" style="font-size:4rem; margin-bottom:15px;">forum</span>
                            ${I18n.t('msg_select_conv')}
                        </div>`;

         if (activeConv) {
            const msgsHtml = activeConv.messages.map(m => {
                const isMe = m.expediteur === 'Vous' || m.expediteur === I18n.t('msg_sender_you');
                return `
                    <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:15px;">
                        <div style="max-width:70%; border-radius:12px; padding:12px 18px; line-height:1.4; font-size:1rem; position:relative;
                            ${isMe ? 'background:var(--primary); color:white; border-bottom-right-radius:2px;' : 'background:#1a1a20; color:#ddd; border-bottom-left-radius:2px; border:1px solid #333;'}">
                            ${m.texte}
                            <div style="font-size:0.7rem; color:${isMe ? 'rgba(255,255,255,0.7)' : '#666'}; text-align:${isMe ? 'right' : 'left'}; margin-top:5px;">
                                ${this.formaterHeure(m.date)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            chatHtml = `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <!-- Header Chat -->
                    <div style="padding:20px; border-bottom:1px solid #222; display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.02);">
                        <a href="/profil/${activeConv.idUtilisateur}" data-link title="${I18n.t('msg_view__profile')}">
                            <img src="${activeConv.avatar}" alt="Avatar" style="width:45px; height:45px; border-radius:50%; background:#222; object-fit:cover; border:2px solid transparent; transition:border 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='transparent'">
                        </a>
                        <div>
                            <h3 style="margin:0;"><a href="/profil/${activeConv.idUtilisateur}" data-link style="color:white; font-size:1.2rem; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='white'">${activeConv.interlocuteur}</a></h3>
                            <span style="font-size:0.85rem; color:#4ade80; display:flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; border-radius:50%; background:#4ade80; display:inline-block;"></span> ${I18n.t('msg_online')}</span>
                        </div>
                        <div style="margin-left:auto; display:flex; gap:15px; color:#aaa;">
                            <span class="material-symbols-outlined" style="cursor:pointer; hover:color:white;">search</span>
                            <span class="material-symbols-outlined" style="cursor:pointer; hover:color:white;">more_vert</span>
                        </div>
                    </div>
                    
                    <!-- Corps des messages -->
                    <div id="chat-messages-container" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column;">
                        ${msgsHtml}
                    </div>
                    
                    <!-- Section Input -->
                    <div style="padding:20px; border-top:1px solid #222; background:rgba(0,0,0,0.2);">
                        <form id="form-message" style="display:flex; gap:10px; align-items:flex-end;">
                            <div style="flex:1; display:flex; align-items:center; background:#1a1a20; border:1px solid #333; border-radius:25px; padding:5px 15px;">
                                <span class="material-symbols-outlined" style="color:#666; cursor:pointer;">sentiment_satisfied</span>
                                <input type="text" id="input-new-msg" placeholder="${I18n.t('msg_input_placeholder')}" style="flex:1; background:transparent; border:none; color:white; padding:12px 10px; font-size:1rem; outline:none;" required autocomplete="off">
                                <span class="material-symbols-outlined" style="color:#666; cursor:pointer;">attach_file</span>
                            </div>
                            <button type="submit" style="background:var(--primary); border:none; border-radius:50%; width:50px; height:50px; display:flex; justify-content:center; align-items:center; color:white; cursor:pointer; flex-shrink:0;">
                                <span class="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            `;
        }

        return `
            <div class="inbox-page" style="max-width:1400px; margin: 40px auto; padding: 0 4%; min-height:80vh; animation: fadeIn 0.4s ease-out;">
                <h1 style="font-family:'Outfit', sans-serif; color:white; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <span class="material-symbols-outlined" style="font-size:2.5rem; color:var(--primary);">mail</span> ${I18n.t('msg_page_title')}
                </h1>
                
                <div class="split-layout" style="display:flex; height:70vh; min-height:600px; border:1px solid #333; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                    
                    <!-- Sidebar Conversations -->
                    <div class="split-sidebar" style="width:350px; background:#0f0f11; border-right:1px solid #222; display:flex; flex-direction:column;">
                        <div style="padding:20px; border-bottom:1px solid #222;">
                            <div style="display:flex; align-items:center; background:#1a1a20; border-radius:8px; padding:10px 15px; border:1px solid #333;">
                                <span class="material-symbols-outlined" style="color:#666; margin-right:10px;">search</span>
                                <input type="text" placeholder="${I18n.t('search_placeholder_short')}..." style="background:transparent; border:none; color:white; outline:none; font-size:0.95rem; width:100%;">
                            </div>
                        </div>
                        <div style="flex:1; overflow-y:auto;" id="conversations-list">
                            ${listeHtml}
                        </div>
                    </div>

                    <!-- Main Chat Area -->
                    <div class="split-content" style="flex:1; background:#0a0a0c; position:relative; display:flex; flex-direction:column;" id="chat-area">
                        ${chatHtml}
                    </div>
                    
                </div>
            </div>
            
            <style>
                .conv-item:hover { background: #1a1a20 !important; }
            </style>
        `;
    }
}
