const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const serviceAccount = require('./serviceAccountKey.json');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FB_PROJECT_ID,
    client_email: process.env.FB_CLIENT_EMAIL,
    private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Corrige as quebras de linha
  }),
});

const db = admin.firestore();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.post('/api/pagarme/orders', async (req, res) => {
  try {
    const pagarmeKey = process.env.PAGARME_API_KEY;
    const response = await axios.post(
      'https://api.pagar.me/core/v5/orders',
      req.body,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${pagarmeKey}:`).toString('base64'),
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro na requisição à Pagar.me:', error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: 'Erro interno' });
  }
});
app.get('/api/pagarme/orders', async (req, res) => {
  try {
    const { order_id } = req.query;
    const pagarmeKey = process.env.PAGARME_API_KEY;
    const response = await axios.get(
      'https://api.pagar.me/core/v5/orders'+`/${order_id}`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${pagarmeKey}:`).toString('base64'),
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro na requisição à Pagar.me:', error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: 'Erro interno' });
  }
});

app.post('/webhook/pagarme', async (req, res) => {
   try {
    const evento = req.body;

    console.log('📩 Webhook recebido:', evento);

    const status = evento.data?.status;
    const transactionId = evento.data?.id;
    const item = evento.data?.items[0];
    console.log(`✅Item ==> '${item?.id}'`);

    if (!transactionId) {
      return res.status(400).send('ID de transação ausente');
    }

    if (item?.code === '1') {

    // Encontre o registro correspondente pelo ID de pagamento
    const snapshot = await db.collection('registrations')
      .where('pagamento.id', '==', transactionId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn('❌ Nenhuma inscrição encontrada para o ID:', transactionId);
      return res.status(404).send('Inscrição não encontrada');
    }

    const docRef = snapshot.docs[0].ref;

    // Atualiza o status do pagamento
    await docRef.update({
      'pagamento.status': status,
      
      updatedAt: new Date()
    });

    console.log(`✅ Status de pagamento atualizado para '${status}'`);}
    else if (item?.code === '2') {
      // Encontre o registro correspondente pelo ID de pagamento
      const snapshot = await db.collection('finders')
        .where('pagamento.id', '==', transactionId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.warn('❌ Nenhuma inscrição encontrada para o ID:', transactionId);
        return res.status(404).send('Inscrição não encontrada');
      }

      const docRef = snapshot.docs[0].ref;

      // Atualiza o status do pagamento
      await docRef.update({
        'pagamento.status': status,
        album:true,
        tipoPagamento: 'pix',
        
        updatedAt: new Date()
      });

      console.log(`✅ Status de pagamento atualizado para '${status}'`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('Erro no servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
