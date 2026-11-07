const database = db.getSiblingDB('vechain')

function ensureUser(user, password, roles) {
  if (!password) throw new Error(`Missing password for ${user}`)
  if (database.getUser(user)) return
  database.createUser({ user, pwd: password, roles })
}

ensureUser('indexer', process.env.MONGO_INDEXER_PASSWORD, [{ role: 'readWrite', db: 'vechain' }])
ensureUser('api', process.env.MONGO_API_PASSWORD, [{ role: 'read', db: 'vechain' }])
