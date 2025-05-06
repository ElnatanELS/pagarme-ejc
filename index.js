const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// NÃO deixe essa chave no código em produção. Use variável de ambiente!
const PAGARME_API_KEY = 'sk_test_9d8a6e3d1c3a407498cebf235de28177';

app.use(cors()); // permite CORS
app.use(express.json()); // aceita JSON do body

app.post('/api/pagarme/orders', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.pagar.me/core/v5/orders',
      req.body,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${PAGARME_API_KEY}:`).toString('base64'),
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
    const response = await axios.get(
      'https://api.pagar.me/core/v5/orders'+`/${order_id}`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${PAGARME_API_KEY}:`).toString('base64'),
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
