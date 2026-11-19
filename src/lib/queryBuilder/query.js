const Database = require('../../service/database');

async function Query(query, ...values) {
  const client = await Database.pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows;
  } finally {
    client.release();
  }
}

async function QueryOne(query, ...values) {
  const client = await Database.pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

module.exports = { Query, QueryOne };
