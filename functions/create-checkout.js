/**
 * ⚡ Cloudflare Pages Function — Créer une session Stripe Checkout
 * Route : POST /functions/create-checkout
 * Variables d'env requises : STRIPE_SECRET_KEY
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

export async function onRequestOptions() {
    return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
    const { STRIPE_SECRET_KEY } = context.env;

    if (!STRIPE_SECRET_KEY) {
        return new Response(JSON.stringify({ error: 'Clé Stripe non configurée' }), {
            status: 500, headers: CORS_HEADERS
        });
    }

    try {
        const body = await context.request.json();
        const { titre, montant, type, projetId, vendeurId, acheteurId } = body;

        // Validation des champs requis
        if (!titre || !montant || !type || !projetId || !vendeurId) {
            return new Response(JSON.stringify({ error: 'Champs manquants' }), {
                status: 400, headers: CORS_HEADERS
            });
        }

        const origin = context.request.headers.get('Origin') || 'https://intoon-studios.pages.dev';

        // Appel direct à l'API Stripe via fetch (pas de SDK)
        const params = new URLSearchParams({
            'payment_method_types[]': 'card',
            'mode': 'payment',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][product_data][name]': titre,
            'line_items[0][price_data][product_data][description]': `InToon — Achat ${type}`,
            'line_items[0][price_data][unit_amount]': String(Math.round(parseFloat(montant) * 100)),
            'line_items[0][quantity]': '1',
            'success_url': `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
            'cancel_url': `${origin}/shop`,
            'metadata[projet_id]': projetId,
            'metadata[vendeur_id]': vendeurId,
            'metadata[acheteur_id]': acheteurId || '',
            'metadata[type]': type,
            'metadata[montant]': String(montant),
        });

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        const session = await stripeRes.json();

        if (!stripeRes.ok) {
            console.error('[Stripe] Erreur création session:', session.error);
            return new Response(JSON.stringify({ error: session.error?.message || 'Erreur Stripe' }), {
                status: 400, headers: CORS_HEADERS
            });
        }

        return new Response(JSON.stringify({ url: session.url, id: session.id }), {
            status: 200, headers: CORS_HEADERS
        });

    } catch (err) {
        console.error('[create-checkout] Exception:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: CORS_HEADERS
        });
    }
}
