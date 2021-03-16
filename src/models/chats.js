const db = require('../helpers/db')

exports.createChat = (data) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    INSERT INTO chats
    (${Object.keys(data).join()})
    VALUES
    (${Object.values(data).map(item => `"${item}"`).join(',')})
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.updateLatestMsg = (id, idReceiver) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
      UPDATE chats
      SET isLatest = 'false'
      WHERE ((idSender=${id} AND idReceiver=${idReceiver}) OR (idSender=${idReceiver} AND idReceiver=${id}))
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.getHistoryChat = (id, idReceiver, cond) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    SELECT * FROM chats 
    WHERE ((idSender=${id} AND idReceiver=${idReceiver}) OR (idSender=${idReceiver} AND idReceiver=${id})) 
    AND message LIKE "%${cond.search}%"
    ORDER BY ${cond.sort} ${cond.order}
    LIMIT ${cond.limit} OFFSET ${cond.offset}
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.getListHistoryChat = (id, cond) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    SELECT c.id, c.idReceiver, c.idSender, s.username AS senderUsername, s.phoneNumber AS senderPhoneNumber, s.picture AS senderPicture, r.username AS receiverUsername, r.phoneNumber AS receiverPhoneNumber, r.picture AS receiverPicture, c.message, c.createdAt
    FROM chats c
    INNER JOIN users s ON s.id = c.idSender
    INNER JOIN users r ON r.id = c.idReceiver
    WHERE (c.idSender=${id} OR c.idReceiver=${id}) AND c.isLatest = 'true' AND c.message LIKE "%${cond.search}%"
    ORDER BY c.${cond.sort} ${cond.order}
    LIMIT ${cond.limit} OFFSET ${cond.offset}
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.getCountHistoryChat = (id, idReceiver, cond) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    SELECT COUNT(id) as totalData FROM chats
    WHERE ((idSender=${id} AND idReceiver=${idReceiver}) OR (idSender=${idReceiver} AND idReceiver=${id})) 
    AND message LIKE "%${cond.search}%"
    ORDER BY ${cond.sort} ${cond.order}
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.getCountListHistoryChat = (id, cond) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    SELECT COUNT(c.id) as totalData
    FROM chats c
    INNER JOIN users s ON s.id = c.idSender
    INNER JOIN users r ON r.id = c.idReceiver
    WHERE (c.idSender=${id} OR c.idReceiver=${id}) AND c.isLatest = 'true'
    ORDER BY c.${cond.sort} ${cond.order}
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.getLastMsg = (id, idReceiver) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    SELECT c.id, s.username AS senderUsername, s.phoneNumber AS senderPhoneNumber, s.picture AS senderPicture, r.username AS receiverUsername, r.phoneNumber AS receiverPhoneNumber, r.picture AS receiverPicture, c.message, c.createdAt
    FROM chats c
    INNER JOIN users s ON s.id = c.idSender
    INNER JOIN users r ON r.id = c.idReceiver
    WHERE ((c.idSender=${id} AND c.idReceiver=${idReceiver}) OR (c.idSender=${idReceiver} AND c.idReceiver=${id}))
    ORDER BY c.createdAt DESC LIMIT 1
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}

exports.getChatList = (id) => {
  return new Promise((resolve, reject) => {
    const query = db.query(`
    SELECT DISTINCT idSender FROM chats
    WHERE idReceiver=${id} OR idSender=${id} 
    UNION SELECT DISTINCT idReceiver FROM chats WHERE idReceiver=${id} OR idSender=${id}
    `, (err, res, field) => {
      if (err) reject(err)
      resolve(res)
    })
    console.log(query.sql)
  })
}
