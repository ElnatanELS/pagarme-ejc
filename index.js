const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
