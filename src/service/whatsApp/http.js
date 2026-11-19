const axios = require('axios');
const Var = require('../../config/var');

const httpCall = ({ method, url, headers = {}, params = null, data = null }) => {
  const options = {
    method,
    url,
    params,
    data,
    headers: {
      Authorization: `Bearer ${Var.whatsApp.token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    responseType: 'json',
  };

  return axios(options).then((response) => response.data);
};

const GET = ({ url, headers, params }) => httpCall({ method: 'get', url, headers, params });

const POST = ({ url, headers, params, data }) => httpCall({ method: 'post', url, headers, params, data });

module.exports = {
  GET,
  POST,
};
