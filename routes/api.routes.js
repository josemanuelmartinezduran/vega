const {
  Router
} = require("express");
const {
  conekta
} = require("conekta");
const router = Router();
const Antares = require("../models/antares");

router.post("/mail", (req, res) => {
  //Validamos la dirección de correo
  var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  const correo = req.body.correo;
  if (!correo)
    return res.send("Error");

  if (correo.length > 254)
    return res.send("Error");

  var valid = emailRegex.test(correo);
  if (!valid)
    return res.send("Error");

  var parts = correo.split("@");
  if (parts[0].length > 64)
    return res.send("Error");

  var domainParts = parts[1].split(".");
  if (domainParts.some(function (part) {
      return part.length > 63;
    }))
    return res.send("Error");

  try {
    console.log("Mailer")
    const nodemailer = require("nodemailer");
    console.log("Ejecutando")
    let transporter = nodemailer.createTransport({
      host: "smtp.dreamhost.com",
      port: 465,
      secure: true,
      auth: {
        user: "ventas@mediform.opentechmx.com",
        pass: "FibfhRb3",
      },
    });
    console.log(transporter);
    const titulo = req.body.titulo;
    const mensaje = req.body.mensaje;
    console.log("Mandando a " + correo + titulo + mensaje);
    let info = transporter.sendMail({
      from: 'ventas@mediform.opentechmx.com',
      to: correo,
      subject: titulo,
      text: mensaje,
      html: mensaje,
    });
    setTimeout(() => {
      console.log(info, "Retornando");
      return res.send("Ok")
    }, 4000)
  } catch (error) {
    console.log("Error");
    console.log(error);
    return res.send("Error")
  }
});

router.patch("/execute", (req, res) => {
  const antares = new Antares();
  const model = req.body.model;
  const params = req.body.params;
  const method = req.body.method;
  console.log("Ejecutando " + model + " metodo " + method + " con " + params);
  return antares
    .execute(model, method, params)
    .then((data) => res.json({
      "sucess": data
    }))
    .catch((err) => res.json({
      "success": err
    }));
});

router.post("/conekta", (req, res) => {
  var conekta = require('conekta');
  conekta.api_key = "key_PpRzxqYJ4zqkurPUVsJyEg";
  conekta.locale = "es";
  const folio = req.body.folio;
  const producto = req.body.producto;
  const precio = req.body.precio;
  const cantidad = req.body.cantidad;
  const nombre = req.body.nombre;
  const mail = req.body.mail;
  const phone = req.body.phone;
  let timestamp = Math.floor(Date.now() / 1000) + (3600 * 24);

  console.log(precio);
  console.log(producto);
  console.log(cantidad);
  conekta.Checkout.create({
      name: folio,
      type: "PaymentLink",
      recurrent: false,
      expires_at: timestamp,
      allowed_payment_methods: ["cash", "card", "bank_transfer"],
      needs_shipping_contact: false,
      monthly_installments_enabled: false,
      monthly_installments_options: [3],
      order_template: {
        line_items: [{
          name: producto,
          unit_price: precio,
          quantity: cantidad
        }, ],
        currency: "MXN",
        customer_info: {
          name: nombre,
          email: mail,
          phone: phone,
        },
        metadata: {
          my_custom_customer_id: "abc123",
        },
      },
    },
    function (err, resp) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(resp.toObject());

      return (res.json(resp.toObject()));
    }
  );
});

router.post("/", (req, res) => {
  const antares = new Antares();
  const params = req.body.data;
  const model = req.body.model;
  console.log("Post");
  console.log(model);
  return antares
    .create(model, params)
    .then((data) => res.json(data))
    .catch((err) => res.json({
      err: err
    }));
});

router.put("/", (req, res) => {
  const antares = new Antares();
  const id = [req.body.id];
  const model = req.body.model;
  const params = req.body.data;
  console.log("Put");
  console.log(model);
  return antares
    .write(model, id, params)
    .then((data) => res.json({
      sucess: data
    }))
    .catch((err) => res.json({
      err: err
    }));
});

router.delete("/", (req, res) => {
  const antares = new Antares();
  const id = [req.body.id];
  const model = req.body.model;
  return antares
    .unlink(model, id)
    .then((data) => res.json({
      id: data
    }))
    .catch((err) => res.json({
      err: err
    }));
});

router.patch("/", (req, res) => {
  const antares = new Antares();
  const params = req.body.domain;
  const model = req.body.model;
  return antares
    .search(model, params)
    .then((data) => res.json(data))
    .catch((err) => res.json({
      err: err
    }));
});

router.get("/", (req, res) => {
  const antares = new Antares();
  const params = req.body.domain;
  const model = req.body.model;
  return antares
    .search(model, params)
    .then((data) => res.json(data))
    .catch((err) => res.json({
      err: err
    }));
});

module.exports = router;