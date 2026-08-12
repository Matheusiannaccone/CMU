//functions/index.js
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions/v1");
const { onDocumentDeleted } = require("firebase-functions/firestore");
const { defineSecret } = require("firebase-functions/params");
const { FieldValue } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const Stripe = require("stripe");

const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

admin.initializeApp();
const db = admin.firestore();


// Define o segredo
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_SECRET_KEY_TEST = defineSecret("STRIPE_SECRET_KEY_TEST");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const STRIPE_WEBHOOK_SECRET_TEST = defineSecret("STRIPE_WEBHOOK_SECRET_TEST");
const RECAPTCHA_SECRET = defineSecret("RECAPTCHA_SECRET");

const PRICE_GENIUS_MENSAL = defineSecret("PRICE_GENIUS_MENSAL");
const PRICE_GENIUS_MENSAL_TEST = defineSecret("PRICE_GENIUS_MENSAL_TEST");

const PRICE_GENIUS_SEMESTRAL = defineSecret("PRICE_GENIUS_SEMESTRAL");
const PRICE_GENIUS_SEMESTRAL_TEST = defineSecret("PRICE_GENIUS_SEMESTRAL_TEST");


const PRICE_PLUS_MENSAL = defineSecret("PRICE_PLUS_MENSAL");
const PRICE_PLUS_MENSAL_TEST = defineSecret("PRICE_PLUS_MENSAL_TEST");

const PRICE_PLUS_SEMESTRAL = defineSecret("PRICE_PLUS_SEMESTRAL");
const PRICE_PLUS_SEMESTRAL_TEST = defineSecret("PRICE_PLUS_SEMESTRAL_TEST");

// Função para obter o cliente Stripe
function getStripe() {
  const stripeKey = isEmulator
  ? STRIPE_SECRET_KEY_TEST.value()
  : STRIPE_SECRET_KEY.value();
  
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY não encontrada");
  }
  
  return new Stripe(stripeKey, { apiVersion: "2023-10-16" });
}

const baseURL = isEmulator
  ? "http://localhost:5000"
  : "https://calculadora-medias-universitarias.vercel.app";

// Mapeamento de preços para planos
function getPriceId({plan, interval, isEmulator}) {
  const key = `${plan}_${interval}`.toUpperCase();

  const map = {
    GENIUS_MENSAL: isEmulator
      ? PRICE_GENIUS_MENSAL_TEST
      : PRICE_GENIUS_MENSAL,

    GENIUS_SEMESTRAL: isEmulator
      ? PRICE_GENIUS_SEMESTRAL_TEST
      : PRICE_GENIUS_SEMESTRAL,
      
    PLUS_MENSAL: isEmulator
      ? PRICE_PLUS_MENSAL_TEST
      : PRICE_PLUS_MENSAL,

    PLUS_SEMESTRAL: isEmulator
      ? PRICE_PLUS_SEMESTRAL_TEST
      : PRICE_PLUS_SEMESTRAL,
  };

  const secret = map[key];
  if (!secret) {
    throw new Error(`Plano inválido: ${plan} / ${interval}`);
  }

  return secret.value();
}

// Funções
exports.createStripeCheckoutSession = onCall(
  { 
    secrets: [
      STRIPE_SECRET_KEY, STRIPE_SECRET_KEY_TEST,
      PRICE_GENIUS_MENSAL, PRICE_GENIUS_MENSAL_TEST,
      PRICE_GENIUS_SEMESTRAL, PRICE_GENIUS_SEMESTRAL_TEST,
      PRICE_PLUS_MENSAL, PRICE_PLUS_MENSAL_TEST,
      PRICE_PLUS_SEMESTRAL, PRICE_PLUS_SEMESTRAL_TEST,
    ],
    region: "southamerica-east1"
  },

  
  async (request) => {
    const { plan, interval } = request.data;

    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Usuário não autenticado"
      );
    }
    
    if (!plan || !interval) {
      throw new HttpsError("invalid-argument", "plan e interval são obrigatórios");
    }
    
    const priceId = getPriceId({plan, interval, isEmulator});
    
    // Stripe inicializado com secret
    const stripe = getStripe();

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",

        payment_method_types: ["card"],

        allow_promotion_codes: true,

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        success_url: `${baseURL}/usuario.html`,
        cancel_url: `${baseURL}/premium.html`,

        metadata: {
          uid: request.auth.uid,
        },
      });

      console.log("✅ Sessão Stripe criada:", session.id);
      return { url: session.url };

    } catch (error) {
      console.error("Stripe error:", error);
      throw new HttpsError("internal", error.message);
    }
});

// Webhook para ouvir eventos do Stripe
exports.stripeWebhook = onRequest(
  { 
    secrets: [
      STRIPE_SECRET_KEY, STRIPE_SECRET_KEY_TEST,
      STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_TEST,
      PRICE_GENIUS_MENSAL, PRICE_GENIUS_MENSAL_TEST,
      PRICE_GENIUS_SEMESTRAL, PRICE_GENIUS_SEMESTRAL_TEST,
      PRICE_PLUS_MENSAL, PRICE_PLUS_MENSAL_TEST,
      PRICE_PLUS_SEMESTRAL, PRICE_PLUS_SEMESTRAL_TEST,
    ], 
    region: "southamerica-east1",
    rawBody: true
  },
  async (req, res) => {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      console.error("Cabeçalho de assinatura ausente");
      return res.status(400).send("Cabeçalho de assinatura ausente");
    }

    const webhookSecret = isEmulator
      ? STRIPE_WEBHOOK_SECRET_TEST.value()
      : STRIPE_WEBHOOK_SECRET.value();
      
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET não encontrada");
      return res.status(500).send("Configuração do webhook ausente");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    function mapPriceToPlan(priceId) {
      const priceMap = {
        // Preços reais
        [PRICE_GENIUS_MENSAL.value()]: "genius",
        [PRICE_GENIUS_SEMESTRAL.value()]: "genius",
        [PRICE_PLUS_MENSAL.value()]: "genius_plus",
        [PRICE_PLUS_SEMESTRAL.value()]: "genius_plus",

        // Testes
        [PRICE_GENIUS_MENSAL_TEST.value()]: "genius",
        [PRICE_GENIUS_SEMESTRAL_TEST.value()]: "genius",
        [PRICE_PLUS_MENSAL_TEST.value()]: "genius_plus",
        [PRICE_PLUS_SEMESTRAL_TEST.value()]: "genius_plus",
      };

      return priceMap[priceId] || null;
    }

    const PRICE_GENIUS = isEmulator
      ? PRICE_GENIUS_MENSAL_TEST.value()
      : PRICE_GENIUS_MENSAL.value();
              
    const PRICE_GENIUS_PLUS = isEmulator
      ? PRICE_PLUS_MENSAL_TEST.value()
      : PRICE_PLUS_MENSAL.value();

    // EVENTOS
    try{
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          if (!session.subscription) {
            console.error("Sessão sem assinatura");
            break;
          }
  
          const uid = session.metadata?.uid;
          if (!uid) {
            console.error("Sessão sem UID do usuário");
            break;
          }
  
          let shouldGrantReward = false;
          let rewardOwnerUid = null;
          let rewardStripeCustomerId = null;
          
          // Verifica se há cupom aplicado
          if (session.discounts && session.discounts.length > 0) {
            const promoCodeId = session.discounts[0].promotion_code;
  
            if(promoCodeId) {
              const promo = await stripe.promotionCodes.retrieve(promoCodeId);
              const code = promo.code;
              const ownerUid = promo.metadata?.ownerUid;
  
              if (!code || !ownerUid) {
                console.warn("Cupom aplicado, mas metadata incompleta");
              } else {
  
                const couponRef = db.collection("cupons").doc(code);
                
                await db.runTransaction(async (tx) => {
                  const couponSnap = await tx.get(couponRef);
  
                  if (!couponSnap.exists) {
                    console.warn("Cupom não encontrado no Firestore:", code);
                  }
  
                  const data = couponSnap.data();
                  const currentCount = data.redeemedCount || 0;
                  const rewardGranted = data.rewardGranted === true;
  
                  const newCount = currentCount + 1;
  
                  let userSnap = null;
                  let userPrivSnap = null;
  
                  if (newCount === 5 && !rewardGranted) {
                    const userRef = db.collection("usuarios").doc(ownerUid);
                    userSnap = await tx.get(userRef);
  
                    const userPrivRef = db.collection("usuarios_priv").doc(ownerUid);
                    userPrivSnap = await tx.get(userPrivRef);
  
                    if (!userSnap.exists) {
                      console.warn("Dono do cupom não encontrado");
                    }
                  }
  
                  tx.update(couponRef, {
                    redeemedCount: newCount,
                  });
  
                  if (newCount === 5 && !rewardGranted) {
                    rewardStripeCustomerId = userPrivSnap.data().stripeCustomerId || null;
                    rewardOwnerUid = ownerUid;
                    shouldGrantReward = true;
  
                    tx.update(couponRef, {
                      rewardGranted: true,
                      rewardGrantedAt: FieldValue.serverTimestamp(),
                    });
                  }
                });
              
                console.log(
                `Cupom ${code} usado por ${uid}, dono do cupom: ${ownerUid}`
                );
              }
            }
          }
          
          // Recompensa Stripe (fora da transaction)
          if (shouldGrantReward && rewardOwnerUid) {
            // garante customer
            if (!rewardStripeCustomerId) {
              const customer = await stripe.customers.create({
                metadata: { uid: rewardOwnerUid, source: "referral_reward" },
              });
  
              rewardStripeCustomerId = customer.id;
  
              await db.collection("usuarios_priv").doc(rewardOwnerUid).set(
                { stripeCustomerId: rewardStripeCustomerId },
                { merge: true }
              );
            }
  
            // Busca assinatura ativa
            const subs = await stripe.subscriptions.list({
              customer: rewardStripeCustomerId,
              status: "active",
              limit: 1,
            });
  
            let subscription;
  
            if (subs.data.length > 0) {
              // Caso 1: já tem assinatura ativa
              // Considera apenas ativa ou em trial
              subscription = subs.data.find(
                s => s.status === "active" || s.status === "trialing"
              );
  
              if (!subscription) {
                console.warn("Usuário não possui assinatura ativa ou em trial");
                break;
              }
  
              const item = subscription.items.data[0];
              const currentPriceId = item.price.id;
  
              // Se já for genius+, apenas estende (opcional)
              const currentPlan = mapPriceToPlan(currentPriceId);
              if (currentPlan === "genius_plus") {
                await stripe.subscriptions.update(subscription.id, {
                  current_period_end:
                    subscription.current_period_end + 30 * 24 * 60 * 60,
                  proration_behavior: "none",
                  metadata: {
                    uid: rewardOwnerUid,
                    reward: "referral_extension_30d",
                  },
                });
  
              } else {
                // 1️⃣ UPGRADE IMEDIATO PARA GENIUS+
                await stripe.subscriptions.update(subscription.id, {
                  items: [
                    {
                      id: item.id,
                      price: PRICE_GENIUS_PLUS,
                    },
                  ],
                  proration_behavior: "none",
                  metadata: {
                    uid: rewardOwnerUid,
                    reward: "referral_upgrade_30d",
                  },
                });
  
                // 2️⃣ AGENDA DOWNGRADE AUTOMÁTICO PARA GENIUS
                const now = Math.floor(Date.now() / 1000);
  
                await stripe.subscriptionSchedules.create({
                  from_subscription: subscription.id,
                  phases: [
                    {
                      start_date: now,
                      end_date: now + 30 * 24 * 60 * 60,
                      items: [{ price: PRICE_GENIUS_PLUS }],
                      proration_behavior: "none",
                    },
                    {
                      items: [{ price: PRICE_GENIUS }],
                    },
                  ],
                  metadata: {
                    uid: rewardOwnerUid,
                    reason: "referral_reward_downgrade",
                  },
                });
              }
  
              // Atualiza Firestore
              const rewardUserRef = db.collection("usuarios").doc(rewardOwnerUid);
              const rewardUserSnap = await rewardUserRef.get();

              if(rewardUserSnap.data()?.tipoUsuario !== "genius_plus") {
                await rewardUserRef.set(
                  {
                    tipoUsuario: "genius_plus",
                    updatedAt: FieldValue.serverTimestamp(),
                  },
                  { merge: true }
                );
              } 
  
              console.log(
                `Upgrade temporário para genius+ concedido ao usuário ${rewardOwnerUid}`
              );
  
  
            } else {
              // Caso 2: não tem assinatura ativa
              subscription = await stripe.subscriptions.create({
                customer: rewardStripeCustomerId,
                items: [ { price: PRICE_GENIUS_PLUS }, ],
                trial_period_days: 30,
                metadata: { uid: rewardOwnerUid, reward: "referral_reward", },
              });
  
              //-------------------------------------------
              // downgrade automático para plano gratuito
              //-------------------------------------------
              
              // Salva subscriptionId no Firestore
              await db.collection("usuarios").doc(rewardOwnerUid).set(
                {
                  tipoUsuario: "genius_plus",
                  updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
              );

              await db.collection("usuarios_priv").doc(rewardOwnerUid).set(
                {
                  stripeCustomerId: rewardStripeCustomerId,
                  subscriptionId: subscription.id,
                  updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            }
              
            console.log(
              `Recompensa concedida para ${rewardOwnerUid} com assinatura ${subscription.id}`
            );
          }
  
          // Usuário que pagou
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription,
          );
      
  
          const priceId = subscription.items.data[0].price.id;
          const plano = mapPriceToPlan(priceId);
  
          if (!plano) {
            console.error("Price desconhecido:", priceId);
            break;
          }

          const userRef = db.collection("usuarios").doc(uid);
          const userSnap = await userRef.get();

          const userPrivRef = db.collection("usuarios_priv").doc(uid);
          const userPrivSnap = await userPrivRef.get();

          if (userSnap.data()?.tipoUsuario !== plano) {
            await userRef.set(
              {
                tipoUsuario: plano,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true });
            }

          if (userPrivSnap.data()?.stripeCustomerId !== session.customer ||
              userPrivSnap.data()?.subscriptionId !== session.subscription) {
            await userPrivRef.set(
              {
                stripeCustomerId: session.customer,
                subscriptionId: session.subscription,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
  
          console.log(`Usuário ${uid} atualizado para plano ${plano}`);
          break;
        }
  
        case "customer.subscription.updated": {
          const subscription = event.data.object;
  
          // Ignora assinaturas incompletas, canceladas ou em trial expirado
          if (!["active", "trialing"].includes(subscription.status)) {
            console.log(
              `Subscription ${subscription.id} ignorada (status: ${subscription.status})`
            );
            break;
          }
  
          // Segurança: garante que existe item
          if (!subscription.items?.data?.length) {
            console.error("Subscription sem itens:", subscription.id);
            break;
          }
  
          const customerId = subscription.customer;
  
          if (!customerId) {
            console.error("Subscription sem customer:", subscription.id);
            break;
          }
  
          const snapshot = await db
            .collection("usuarios_priv")
            .where("stripeCustomerId", "==", customerId)
            .get();
  
          if (snapshot.empty) {
            console.warn(
              `Nenhum usuário encontrado para stripeCustomerId ${customerId}`
            );
            break;
          }
  
          const userDoc = snapshot.docs[0];
  
          const priceId = subscription.items.data[0].price.id;
          const plano = mapPriceToPlan(priceId);
  
          if (!plano) {
            console.error("Price desconhecido:", priceId);
            break;
          }

          const userPrivRef = userDoc.ref;
          const uid = userDoc.id;
  
          await userPrivRef.set(
            {
              subscriptionId: subscription.id,
              stripeCustomerId: subscription.customer,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          const userRef = db.collection("usuarios").doc(uid);
          const userSnap = await userRef.get();

          if(userSnap.data()?.tipoUsuario !== plano) {
            await userRef.set(
              {
                tipoUsuario: plano,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
  
          console.log(`Plano atualizado para ${plano}`);
          break;
        } 
  
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
  
          const snapshot = await db.collection("usuarios_priv")
            .where("subscriptionId", "==", subscription.id)
            .get();
  
            snapshot.forEach(async (docSnap) => {
              const uid = docSnap.id;

              // Limpa dados sensíveis
              await docSnap.ref.set({
                subscriptionId: FieldValue.delete(),
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true });
              
              // Downgrade para plano gratuito
              await db.collection("usuarios").doc(uid).set({
                tipoUsuario: "padrao",
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true });
  
              console.log(`Assinatura cancelada para usuário ${uid}`);
            });
          break;
        }
      }
    } catch (err) {
      console.error("Erro ao processar evento do webhook:", err);
      return res.status(500).send("Erro ao processar evento");
    }

    return res.json({ received: true });
});

// Cria sessão do portal de assinaturas
exports.createStripeCustomerPortal = onCall(
  {
    secrets: [STRIPE_SECRET_KEY, STRIPE_SECRET_KEY_TEST],
    region: "southamerica-east1"
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Usuário não autenticado"
      );
    }

    const userSnap = await db
      .collection("usuarios_priv")
      .doc(request.auth.uid)
      .get();

    if (!userSnap.exists) {
      throw new HttpsError(
        "not-found",
        "Usuário não encontrado"
      );
    }

    const userData = userSnap.data();
    const stripeCustomerId = userData.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new HttpsError(
        "failed-precondition",
        "Usuário não possui customer no Stripe"
      );
    }

    const stripe = getStripe();

    try {
      const portalSession =
        await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${baseURL}/usuario.html`,
        });

      return { url: portalSession.url };

    } catch (err) {
      console.error("Erro ao criar portal:", err);
      throw new HttpsError(
        "internal",
        "Erro ao criar portal de assinaturas"
      );
    }
  });

// Verificação do reCAPTCHA v3
exports.verifyRecaptcha = onCall(
  { 
    secrets: [RECAPTCHA_SECRET],
    region: "southamerica-east1"
  }, 
  async (request) => {
  const { token, action } = request.data;

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${RECAPTCHA_SECRET.value()}&response=${token}`,
    }
  );

  const result = await response.json();

  if (!result.success) {
    throw new HttpsError(
      "permission-denied",
      "Falha na verificação do reCAPTCHA"
    );
  }

  if (result.action !== action ) {
    throw new HttpsError(
      "permission-denied",
      "Ação inválida"
    );
  }

  if (result.score < 0.7) {
    throw new HttpsError(
      "permission-denied",
      "Atividade suspeita detectada"
    );
  }

  return {
    success: true,
    score: result.score
  }
});

// Geração de cupom de indicação
exports.generateReferralCoupon = onCall(
  { 
    secrets: [STRIPE_SECRET_KEY, STRIPE_SECRET_KEY_TEST],
    region: "southamerica-east1"
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Usuário não autenticado");
    }

    const uid = request.auth.uid;
    const stripe = getStripe();

    const existing = await db
      .collection("cupons")
      .where("ownerUid", "==", uid)
      .get();
      
    if (!existing.empty) {
      throw new HttpsError("failed-precondition", "Usuário já possui um cupom");
  
    }

    const userSnap = await db
      .collection("usuarios")
      .doc(uid)
      .get();

    if (!userSnap.exists) {
      throw new HttpsError("not-found", "Usuário não encontrado");
    }

    // Gerar código simples e legível
    const code =
      "CMU" +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Cria cupom no Stripe
    const coupon_id = isEmulator
      ? "Ts7M0g2N" 
      : "MmEiyRyG";
    const promo = await stripe.promotionCodes.create({
      coupon: coupon_id,
      code: code, 
      max_redemptions: 5,
      metadata: {
        ownerUid: uid,
      },
    });

    // Salva no Firestore
    await db.collection("cupons").doc(code).set({
      code,
      ownerUid: uid,
      stripePromotionCodeId: promo.id,
      active: true,
      redeemedCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { code };
  }
);

exports.onUserCreated = functions
  .region("southamerica-east1")
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email } = user;

    if (!email) return;

    try{
      await db.collection("usuarios_priv").doc(uid).set({
        email: email,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log("Usuário privado criado:", uid);
    } catch (error) {
      console.error("Erro ao criar usuário privado:", error);
    }
  }
);


exports.deleteAccount = onRequest(
  { region: "southamerica-east1" },
  async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send("Não autorizado");
    }

    try {
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      await db.collection("usuarios").doc(uid).delete();

      await admin.auth().deleteUser(uid);

      res.send("Conta deletada com sucesso");
    } catch (err) {
      console.error("Erro ao deletar conta:", err);
      res.status(500).send("Erro ao deletar conta");
    }
  }
)

exports.deleteUserData = onDocumentDeleted(
  { document: "usuarios/{uid}", region: "southamerica-east1" },
  async (event) => {
    const uid = event.params.uid;
    
    if (!uid) {
      throw new Error("invalid-argument", "UID é obrigatório");
    }
    
    const batch = db.batch();

      batch.delete(db.collection("usuarios_priv").doc(uid));

      // Deleta cupons criados pelo usuário
      const cuponsSnap = await db.collection("cupons")
        .where("ownerUid", "==", uid)
        .get();

      cuponsSnap.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
  }
);