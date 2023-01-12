require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
var ImageKit = require("imagekit");
const Pusher = require("pusher");
const fs = require("fs");
const chalk = require("chalk");
const app = express();
app.set("trust proxy", true);
const { createClient } = require("@supabase/supabase-js");
const port = process.env.PORT;

const supabase = createClient(
  "https://bbqmbttgbwghvcoedszb.supabase.co",
  process.env.SUPABASE_SERVICE_KEY
);

let userData = [];

var log = (toLog, error = 0) => {
  if (error) {
    console.log(chalk.red("[server]" + chalk.reset.red(" " + toLog)));
    return;
  }
  console.log(chalk.red("[server]" + chalk.reset.cyan(" " + toLog)));
};

log("Supabase Api Key: " + process.env.SUPABASE_SERVICE_KEY);

let sessionsData = [];

let currentSession;

var imagekit = new ImageKit({
  publicKey: "public_D202xiGxO/ZlrH8PUHojBH95ft8=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: "https://ik.imagekit.io/mystical/",
});

const pusher = new Pusher({
  appId: "1506685",
  key: "13fcdedc78efac0503d7",
  secret: "3e94094902503561ff9d",
  cluster: "eu",
  useTLS: true,
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(fileUpload());

app.get(["/", "/post", "/settings"], (req, res, next) => {
  //check cookies if user is verified
  console.log(req.originalUrl);
  if (!req.cookies.id) {
    res.redirect("/login");
    return;
  }
  console.log("Id", req.cookies.id);
  //get supabase user data
  if (userData.find((e) => e.id == req.cookies.id)?.verified) {
    if (userData.find((e) => e.id == req.cookies.id)?.realName) {
      console.log(userData);
      next();
      return;
    }
  }
  supabase.auth.admin
    .getUserById(req.cookies.id)
    .then((user) => {
      console.log(user);

      if (user.data.user.email_confirmed_at) {
        if (user.data.user.user_metadata.realName) {
          userData.push({
            id: req.cookies.id,
            verified: true,
            realName: true,
          });
          next();
          return;
        }
        console.log(user.data.user.user_metadata.realName);
        userData.push({ id: req.cookies.id, verified: true });
        res.redirect("/createName");
        return;
      }
      res.redirect("/confirmEmail?email=" + user.data.user.email);
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/login");
    });
});

app.use(express.static("public"));
app.use((req, res, next) => {
  log(req.ip + " requests: " + req.url);
  next();
});

app.post("/api/orders/new", (req, res) => {
  if (!req.body) {
    res.status(400).send("No request body");
    return;
  }
  newOrder(req.body, currentSession)
    .then(() => {
      log(JSON.stringify(req.body));
      pusher.trigger("orders", "new-order", req.body).catch((err) => log(err));
      res.status(200).send(req.body);
    })
    .catch((err) => {
      log(err, 1);
      res.status(500).send(err);
    });
});

app.get("/api/user/logout", (req) => {
  console.log(userData);
  const objWithIdIndex = userData.findIndex((obj) => obj.id === req.cookies.id);

  if (objWithIdIndex > -1) {
    userData.splice(objWithIdIndex, 1);
  }
  console.log(userData);
});

app.get("/api/user/makeAdmin", (req, res) => {
  if (!req.query.id) {
    res.send("No id provided");
    return;
  }
  supabase.auth.admin
    .updateUserById(req.query.id, {
      user_metadata: { isPizzaCreator: true },
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/api/user/setPriority", (req, res) => {
  if (!req.query.id) {
    res.send("No id provided");
    return;
  }
  if (!req.query.priority) {
    res.send("No priority provided");
    return;
  }
  supabase.auth.admin
    .updateUserById(req.query.id, {
      user_metadata: { priority: req.query.priority },
    })
    .then((data) => {
      pusher
        .trigger(
          "updates",
          "changePriority",
          data.data.user.user_metadata.priority
        )
        .then(() => {
          res.send(data);
        })
        .catch((err) => log(err, 1));
      return;
    })
    .catch((err) => {
      log(err, 1);
      res.status(500).send(err);
    });
});

app.get("/api/users/getAll", function (req, res) {
  supabase.auth.admin.listUsers().then((data) => {
    res.send(JSON.stringify(data));
  });
});

app.post("/api/image/upload/profilePicture", function (req, res) {
  if (!req.files.image) {
    res.send({ status: 400, message: "No image specified" });
    return;
  }
  console.log(req.files.image);
  imagekit.upload(
    {
      file: req.files.image.data, //required
      fileName: req.files.image.md5, //required
      overwriteFile: true,
      useUniqueFileName: false,
      tags: ["p-o-s", "profile-picture"],
    },
    async function (error, result) {
      if (error) {
        console.log(error);
        res.send({
          status: 500,
          message: "Internal server error: " + error,
        });
      } else {
        res.send({
          status: 200,
          file: {
            url: result.url,
          },
        });
      }
    }
  );
});

app.get("/api/ingredients/new", (req, res) => {
  if (!req.query.name) {
    res.status(400).send("No name specified");
    return;
  }
  log("reading data file to get ingredients");
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      log("error while reading file", 1);
      return reject(err);
    }
    log("data file loaded successfully");
    if (data != "") {
      data = JSON.parse(data);
      log(data.ingredients);
      if (!data.ingredients) data.ingredients = [req.query.name];
      if (data.ingredients.find((e) => e == req.query.name)) {
        res.status(400).send("Ingredient already exist");
        return;
      }
      data.ingredients.push(req.query.name);
      log(data.ingredients);
      fs.writeFile("data.json", JSON.stringify(data), () => {
        res.send(data.ingredients);
      });
      return;
    }
    fs.writeFile(
      "data.json",
      JSON.stringify({ ingredients: [req.query.name] }),
      () => {}
    );
    res.send(
      data.ingredients
        ? [...data.ingredients, req.query.name]
        : [req.query.name]
    );
  });
});

app.get("/api/ingredients/remove", (req, res) => {
  if (!req.query.name) {
    res.status(400).send("No name specified");
    return;
  }
  log("reading data file to get ingredients");
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      log("error while reading file", 1);
      return reject(err);
    }
    log("data file loaded successfully");
    if (data != "") {
      data = JSON.parse(data);
      if (!data.ingredients) {
        res.status(400).send("Ingredient does not exist");
        return;
      }
      data.ingredients = data.ingredients.filter((e) => e != req.query.name);
      log(data.ingredients);
      fs.writeFile("data.json", JSON.stringify(data), () => {
        res.send(data.ingredients);
      });
      return;
    }
    res.status(400).send("Ingredient does not exist");
  });
});

app.get("/api/ingredients/get", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (data != "") {
      data = JSON.parse(data);
      res.send(data.ingredients);
      return;
    }
    res.send([]);
  });
});

app.get("/api/options/new", (req, res) => {
  if (!req.query.name) {
    res.status(400).send("No name specified");
    return;
  }
  log("reading data file to get options");
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      log("error while reading file", 1);
      return reject(err);
    }
    log("data file loaded successfully");
    if (data != "") {
      data = JSON.parse(data);
      if (!data.options) data.options = [req.query.name];
      else if (data.options.find((e) => e == req.query.name)) {
        log(data.options.find((e) => e == req.query.name));
        res.status(400).send("Option already exist");
        return;
      } else data.options.push(req.query.name);
      fs.writeFile("data.json", JSON.stringify(data), () => {
        res.send(data.options);
      });
      return;
    }
    fs.writeFile(
      "data.json",
      JSON.stringify({ options: [req.query.name] }),
      () => {}
    );
    res.send(
      data.options ? [...data.optionts, req.query.name] : [req.query.name]
    );
  });
});

app.get("/api/options/remove", (req, res) => {
  if (!req.query.name) {
    res.status(400).send("No name specified");
    return;
  }
  log("reading data file to get options");
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      log("error while reading file", 1);
      return reject(err);
    }
    log("data file loaded successfully");
    if (data != "") {
      data = JSON.parse(data);
      if (!data.options) {
        res.status(400).send("Option does not exist");
        return;
      }
      data.options = data.options.filter((e) => e != req.query.name);
      log(data.options);
      fs.writeFile("data.json", JSON.stringify(data), () => {
        res.send(data.options);
      });
      return;
    }
    res.status(400).send("Option does not exist");
  });
});

app.get("/api/options/get", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (data != "") {
      data = JSON.parse(data);
      res.send(data.options);
      return;
    }
    res.send([]);
  });
});

app.all("/api/session/get", (req, res) => {
  if (currentSession) res.send(currentSession);
});

app.post("/api/session/new", (req, res) => {
  if (!req.body || !req.body.ingredients || !req.body.options) {
    res.status(400).send("No/Wrong request body");
    return;
  }
  initNewSession(req.body.ingredients, req.body.options)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send("Error while creating session"));
});

app.all("/api/orders/get", (req, res) => {
  getOrders(currentSession)
    .then((orders) => {
      res.send(orders);
    })
    .catch((err) => {
      log(err, 1);
      res.status(500).send(err);
    });
});

app.all("/api/session/data/get", (req, res) => {
  if (
    !currentSession ||
    currentSession.length == 0 ||
    currentSession == "123456"
  ) {
    res.status(500).send("There currently is no session");
    return;
  }
  getSessionData(currentSession)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      log(err, 1);
      res.status(500).send(err);
    });
});

function newOrder(order, sessionId) {
  return new Promise(function (resolve, reject) {
    log("writing new order: " + order);
    currentSessionData = sessionsData.find(
      (session) => session.id === sessionId
    );
    if (!currentSessionData || currentSessionData.fileVersion == 0) {
      currentSessionData
        ? ""
        : sessionsData.push({
            id: sessionId,
            fileVersion: 0,
          });
      log("No sessionData or fileVersion == 0");
      fs.readFile(`sessions/${sessionId}/data.json`, (err, data) => {
        if (data && data != "") {
          data = JSON.parse(data);
          data.fileVersion++;
          data.orders.push(order);
          fs.writeFile(
            `sessions/${sessionId}/data.json`,
            JSON.stringify(data),
            (err) => {
              log("file written");
              if (err) {
                log(err, 1);
                reject(err);
                return;
              }
              log("no errors while writing file");
              sessionsData.fileVersion++;
              resolve();
            }
          );
          return;
        }
        reject("Session file does not exist or is empty");
      });
      return;
    }
    log("Sessiondata exists and version is bigger than 0");
    fs.readFile(`sessions/${sessionId}/data.json`, (err, data) => {
      log("data file readen");
      if (err) {
        log(err, 1);
        reject(err);
        return;
      }
      log("no errors while reading file");
      if (data == "") {
        reject("Session data file is empty");
        return;
      }
      data = JSON.parse(data);
      data.fileVersion++;
      data.orders.push(order);
      fs.writeFile(
        `sessions/${sessionId}/data.json`,
        JSON.stringify(data),
        (err) => {
          log("file written");
          if (err) {
            log(err, 1);
            reject(err);
            return;
          }
          log("no errors while writing file");
          sessionsData.fileVersion++;
          resolve();
          return;
        }
      );
    });
  });
}

function initNewSession(ingredients, options) {
  return new Promise(function (resolve, reject) {
    currentSession = Date.now().toString().slice(3, 9);
    log("creating new session");
    fs.readFile("data.json", "utf8", (err, data) => {
      if (err) {
        log("error while reading data file", 1);
        return reject(err);
      }
      if (data != "") {
        data = JSON.parse(data);
        if (data.sessions && data.sessions[currentSession]) {
          log("session already exists", 1);
          return reject("session alredy exists");
        }
        if (!data.sessions) {
          data.sessions = [currentSession];
        } else {
          data.sessions.push(currentSession);
        }
      } else {
        data = {
          ingredients,
          options,
          sessions: [currentSession],
        };
      }
      fs.writeFile("data.json", JSON.stringify(data), (err) => {
        if (err) {
          log("error while writing to data file", 1);
          return reject(err);
        }
        initSessionFile(currentSession, ingredients, options, resolve, reject);
      });
    });
  });
}

async function initSessionFile(
  sessionId,
  ingredients = [],
  options = [],
  resolve,
  reject
) {
  log("initing new session file");
  fs.mkdir(`sessions/${sessionId}`, (err) => {
    log("session folder created");
    if (err) {
      log("error while creating session folder", 1);
      log(err, 1);
      return reject(err);
    }
    log("no errors while creating session folder");
    fs.writeFile(
      `sessions/${sessionId}/data.json`,
      JSON.stringify({
        fileVersion: 1,
        ingredients,
        options,
        orders: [],
      }),
      (err) => {
        log("file created and written with data");
        if (err) {
          log(err, 1);
          return reject(err);
        }
        log("no errors while writing file");
        if (!sessionsData.find((e) => e.id == sessionId))
          sessionsData.push({
            id: sessionId,
            fileVersion: 1,
            ingredients,
            options,
          });
        return resolve(JSON.stringify(sessionId));
      }
    );
  });
}

function getOrders(sessionId) {
  return new Promise(function (resolve, reject) {
    log("getting orders for: " + sessionId);
    fs.readFile(`sessions/${sessionId}/data.json`, (err, data) => {
      if (err) {
        log(err, 1);
        reject(err);
        return;
      }
      resolve(JSON.parse(data).orders);
    });
  });
}

function getSessionData(sessionId, options = 0) {
  log("getting session data");
  return new Promise(function (resolve, reject) {
    log("getting ingredients for: " + sessionId);
    fs.readFile(`sessions/${sessionId}/data.json`, (err, data) => {
      if (err) {
        log(err, 1);
        reject(err);
        return;
      }
      log("returning data");
      resolve({ ...JSON.parse(data), id: sessionId });
    });
  });
}

//start server
app.listen(port, () => {
  require("dns").lookup(require("os").hostname(), function (err, add, fam) {
    log(`server running on http://${add}:${port}`);
  });
  fs.readFile("data.json", "utf8", (err, data) => {
    if (data.trim() != "") {
      data = JSON.parse(data);
      if (data.sessions) {
        let lastSession = data.sessions[data.sessions.length - 1];
        if (Date.now().toString().slice(3, 9) - lastSession < 60)
          currentSession = lastSession;
        log("currentSession: " + currentSession);
      }
    }
  });
});
