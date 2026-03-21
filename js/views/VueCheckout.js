export default class VueCheckout {
    static rendre(plan = '5') {
        const total = parseFloat(plan);
        const ht = (total / 1.2).toFixed(2);
        const tva = (total - ht).toFixed(2);
        const name = plan === '35' ? 'Mécène Argent' : (plan === '50' ? 'Mécène Or' : 'Supporter');
        
        return `
            <div class="checkout-page" style="padding: 60px 4%; animation: fadeIn 0.5s ease-out; max-width: 900px; margin: 0 auto; min-height:80vh; display:flex; gap:40px; flex-wrap:wrap; justify-content:center; align-items:flex-start;">
                
                <!-- RÉSUMÉ COMMANDE -->
                <div style="flex:1; min-width:300px; background:rgba(25,25,30,0.5); padding:40px; border-radius:12px; border:1px solid #333;">
                    <div style="display:flex; align-items:center; gap:15px; margin-bottom:30px; border-bottom:1px solid #333; padding-bottom:20px;">
                        <span class="material-symbols-outlined" style="font-size:3rem; color:#eab308;">stars</span>
                        <div>
                            <h2 style="font-size:1.5rem; color:white; font-family:'Outfit', sans-serif;">Abonnement VIP</h2>
                            <p style="color:#aaa; font-size:0.9rem;">Soutien Mensuel Intoon Studios</p>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:1.1rem; color:#ccc;">
                        <span>Sous-total (${name})</span>
                        <span>${ht} €</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:1.1rem; color:#ccc;">
                        <span>Taxes (TVA 20%)</span>
                        <span>${tva} €</span>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:1px dashed #444; font-size:1.5rem; color:white; font-weight:bold; font-family:'Outfit', sans-serif;">
                        <span>TOTAL</span>
                        <span>${total.toFixed(2)} €<span style="font-size:0.9rem; color:#888;">/mois</span></span>
                    </div>
                </div>

                <!-- FORMULAIRE DE PAIEMENT SIMULÉ -->
                <div style="flex:1.5; min-width:350px; background:#111; padding:40px; border-radius:12px; border:1px solid #222; box-shadow:0 10px 40px rgba(0,0,0,0.8);">
                    <h2 style="font-size:1.8rem; color:white; font-family:'Outfit', sans-serif; margin-bottom:30px;">Détails de facturation</h2>
                    
                    <button class="btn-secondary" style="width:100%; border:1px solid #333; background:black; color:white; padding:15px; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:20px; font-size:1.1rem;">
                        <span class="material-symbols-outlined" style="font-size:1.5rem;">apple</span> Payer avec Apple Pay
                    </button>

                    <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px;">
                        <hr style="flex:1; border:none; border-top:1px solid #333;">
                        <span style="color:#666; font-size:0.9rem;">ou payer par carte</span>
                        <hr style="flex:1; border:none; border-top:1px solid #333;">
                    </div>

                    <form id="form-checkout" style="display:flex; flex-direction:column; gap:20px;">
                        <div>
                            <label style="color:#aaa; font-size:0.9rem; margin-bottom:8px; display:block;">Email</label>
                            <input type="email" placeholder="votre@email.com" style="width:100%; padding:15px; background:#1a1a20; border:1px solid #333; border-radius:6px; color:white; font-size:1rem;" value="user@intoon.com" required>
                        </div>
                        
                        <div>
                            <label style="color:#aaa; font-size:0.9rem; margin-bottom:8px; display:block;">Informations de la carte</label>
                            <div style="display:flex; flex-direction:column; border:1px solid #333; border-radius:6px; overflow:hidden;">
                                <div style="display:flex; align-items:center; background:#1a1a20; border-bottom:1px solid #333; padding-right:15px;">
                                    <input type="text" placeholder="1234 5678 9101 1121" style="flex:1; padding:15px; background:transparent; border:none; color:white; font-size:1rem; outline:none;" required>
                                    <span class="material-symbols-outlined" style="color:#555;">credit_card</span>
                                </div>
                                <div style="display:flex; background:#1a1a20;">
                                    <input type="text" placeholder="MM/AA" style="flex:1; padding:15px; background:transparent; border:none; border-right:1px solid #333; color:white; font-size:1rem; outline:none;" required>
                                    <input type="text" placeholder="CVC" style="flex:1; padding:15px; background:transparent; border:none; color:white; font-size:1rem; outline:none;" required>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label style="color:#aaa; font-size:0.9rem; margin-bottom:8px; display:block;">Nom sur la carte</label>
                            <input type="text" placeholder="John Doe" style="width:100%; padding:15px; background:#1a1a20; border:1px solid #333; border-radius:6px; color:white; font-size:1rem;" required>
                        </div>
                        
                        <button type="submit" class="btn-primary" style="width:100%; padding:18px; font-size:1.2rem; background:var(--primary); margin-top:10px; border-radius:6px; font-weight:bold; letter-spacing:1px; display:flex; justify-content:center; align-items:center; gap:10px;">
                            <span class="material-symbols-outlined">lock</span> Payer ${total.toFixed(2)} €
                        </button>
                        
                        <p style="text-align:center; color:#555; font-size:0.8rem; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:5px;">
                            <span class="material-symbols-outlined" style="font-size:1rem;">verified_user</span> Paiement sécurisé test (Simulation)
                        </p>
                    </form>
                </div>
            </div>
        `;
    }
}
