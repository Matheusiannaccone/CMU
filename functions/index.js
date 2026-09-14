//functions/index.js
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions/v1");
const { onDocumentDeleted } = require("firebase-functions/firestore");
const { defineSecret } = require("firebase-functions/params");
const { FieldValue } = require("firebase-admin/firestore");
const admin = require("firebase-admin");


admin.initializeApp();
const db = admin.firestore();


const RECAPTCHA_SECRET = defineSecret("RECAPTCHA_SECRET");

// Resolve o único semestre de usuários comuns em ambiente confiável.
exports.resolveSingleSemester = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Usuário não autenticado");
    }

    if (request.auth.token.multiSemester === true) {
      throw new HttpsError(
        "failed-precondition",
        "Esta conta utiliza o fluxo de múltiplos semestres"
      );
    }

    const uid = request.auth.uid;
    const createIfMissing = request.data?.createIfMissing === true;
    const userRef = db.collection("usuarios").doc(uid);
    const semestresRef = userRef.collection("semestres");

    return db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new HttpsError("not-found", "Perfil do usuário não encontrado");
      }

      const semestresSnap = await transaction.get(semestresRef);

      if (semestresSnap.size > 1) {
        throw new HttpsError(
          "failed-precondition",
          "A conta possui mais de um semestre e requer revisão"
        );
      }

      if (semestresSnap.size === 1) {
        const semestreId = semestresSnap.docs[0].id;

        transaction.set(userRef, { semestreUnicoId: semestreId }, { merge: true });

        return {
          semesterId: semestreId,
          created: false,
        };
      }

      if (!createIfMissing) {
        return {
          semesterId: null,
          created: false,
        };
      }

      const semestreId = "semestre-unico";
      const semestreRef = semestresRef.doc(semestreId);

      transaction.set(semestreRef, {
        nome: "Semestre atual",
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.set(userRef, { semestreUnicoId: semestreId }, { merge: true });

      return {
        semesterId: semestreId,
        created: true,
      };
    });
  }
);

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
