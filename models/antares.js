var Flectra = require("odoo-xmlrpc");
class Antares {

  constructor() {}
  
  conn = new Flectra({
    url: process.env.ANTARES_URL,
    port: process.env.ANTARES_PORT,
    db: process.env.ANTARES_DB,
    username: process.env.ANTARES_USERNAME,
    password: process.env.ANTARES_PASSWD,
  });

  search(model, domain = [], limit = 100) {
    return new Promise((resolve, reject) => {
      this.conn.connect((err) => {
        if (err) {
          reject(err);
        }
        console.log("Connected to Antares server.");
        let inParams = [];
        inParams.push(domain);
        var params = [];
        params.push(inParams);
        const conn = this.conn;
        this.conn.execute_kw(model, "search", params, function (err, value) {
          if (err) {
            reject(err);
          }
          inParams = [];
          inParams.push(value); //ids
          var params = [];
          params.push(inParams);
          conn.execute_kw(model, "read", params, (err2, value2) => {
            console.log("Por retornar el promise");
            if (err2) {
              reject("Error al ejecutar ", err2);
            } else {
              resolve(value2);
            }
          });
        });
      });
    });
  }

  execute(model, method, outparams){
    console.log(model);
    console.log(method);
    return new Promise((resolve, reject) => {
      this.conn.connect((err) => {
        if (err) {
          reject(err);
        }
        console.log("Connected to Antares server.");
        var inParams = [];
        inParams.push(outparams);
        var params = [inParams];
        console.log("Mandando params");
        console.log(params);
        this.conn.execute_kw(model, method, params, function (err, value) {
          if (err) { return console.log(err); }
          else{
            console.log('Result: ', value);
            resolve(value)
          }
          
      });
      });
    });
  }

  create(model, data) {
    return new Promise((resolve, reject) => {
      const conn = this.conn;
      conn.connect(function (err) {
        if (err) {
          reject(err);
        }
        console.log("Connected to Antares server.");
        var inParams = [];
        inParams.push(data);
        var params = [];
        params.push(inParams);
        conn.execute_kw(model, "create", params, function (err, value) {
          if (err) {
            resolve(err);
          } else resolve({ id: value });
        });
      });
    });
  }

  write(model, ids, data) {
    return new Promise((resolve, reject) => {
      const conn = this.conn;
      conn.connect(function (err) {
        if (err) {
          reject(err);
        }
        console.log("Connected to Antares server.");
        var inParams = [];
        inParams.push(ids); //id to update
        inParams.push(data);
        var params = [];
        params.push(inParams);
        conn.execute_kw(model, "write", params, function (err, value) {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
    });
  }

  unlink(model, ids) {
    return new Promise((resolve, reject) => {
      const conn = this.conn;
      conn.connect(function (err) {
        if (err) {
          reject(err);
        }
        console.log("Connected to Antares server.");
        var inParams = [];
        inParams.push(ids); //id to delete
        var params = [];
        params.push(inParams);
        conn.execute_kw(model, "unlink", params, (err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
    });
  }
}

module.exports = Antares;