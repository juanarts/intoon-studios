/**
 * ⚡ Cloudflare Pages Function — Webhook Stripe
 * Route : POST /functions/stripe-webhook
 * Variables d'env requises : STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
 * 
 * Ce webhook est appelé automatiquement par Stripe après un paiement réussi.
 * Il enregistre la commande dans la table Supabase `commandes`.
 */

/**
 * Vérification de la signature Stripe via Web Crypto API (natif Cloudflare Workers)
 */
async function verifierSignatureStripe(payload, sigHeader, secret) {
    try {
        const parts = sigHeader.split(',');
        const timestampPart = parts.find(p => p.startsWith('t='));
        const sigPart = parts.find(p => p.startsWith('v1='));

        if (!timestampPart || !sigPart) return false;

        const timestamp = timestampPart.split('=')[1];
        const signature = sigPart.split('=').slice(1).join('=');

        const signedPayload = `${timestamp}.${payload}`;

        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
        const expectedSig = Array.from(new Uint8Array(sig))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return expectedSig === signature;
    } catch (e) {
        console.error('[Webhook] Erreur vérification signature:', e);
        return false;
    }
}

export async function onRequestPost(context) {
    const { STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_KEY } = context.env;

    // URL Supabase (même que dans Env.js)
    const SUPABASE_URL = context.env.SUPABASE_URL || 'https://zrocotsbsgiddvcpavcb.supabase.co';

    const payload = await context.request.text();
    const sigHeader = context.request.headers.get('stripe-signature');

    // ── Vérification de la signature ────────────────────────────────────────
    if (!STRIPE_WEBHOOK_SECRET) {
        console.warn('[Webhook] STRIPE_WEBHOOK_SECRET manquant — signature non vérifiée en dev');
    } else {
        const isValid = await verifierSignatureStripe(payload, sigHeader || '', STRIPE_WEBHOOK_SECRET);
        if (!isValid) {
            console.error('[Webhook] Signature invalide !');
            return new Response('Signature invalide', { status: 400 });
        }
    }

    const event = JSON.parse(payload);
    console.log(`[Webhook] Événement reçu : ${event.type}`);

    // ── Traitement des événements Stripe ────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        if (session.payment_status !== 'paid') {
            console.log('[Webhook] Session non payée, ignoré.');
            return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        const { projet_id, vendeur_id, acheteur_id, type, montant } = session.metadata || {};

        if (!projet_id || !vendeur_id) {
            console.error('[Webhook] Métadonnées Stripe manquantes :', session.metadata);
            return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        // ── Insertion dans Supabase ──────────────────────────────────────────
        try {
            const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/commandes`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    vendeur_id,
                    acheteur_id: acheteur_id || null,
                    projet_id,
                    type: type || 'physical',
                    montant: parseFloat(montant) || 0,
                    stripe_session_id: session.id,
                    statut: 'paid'
                })
            });

            if (!supabaseRes.ok) {
                const errBody = await supabaseRes.text();
                console.error('[Webhook] Erreur Supabase insert:', errBody);
            } else {
                console.log('[Webhook] ✅ Commande enregistrée en BDD :', session.id);
            }
        } catch (dbErr) {
            console.error('[Webhook] Exception Supabase:', dbErr);
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
