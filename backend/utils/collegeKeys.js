const forge = require("node-forge");
const fs = require("fs");
const path = require("path");

// Generate or load college keypair (for demo, generate on startup and keep in memory)
let collegeKeyPair;
if (
  fs.existsSync(path.join(__dirname, "../certificates/college_private.pem")) &&
  fs.existsSync(path.join(__dirname, "../certificates/college_public.pem"))
) {
  collegeKeyPair = {
    privateKey: fs.readFileSync(
      path.join(__dirname, "../certificates/college_private.pem"),
      "utf8"
    ),
    publicKey: fs.readFileSync(
      path.join(__dirname, "../certificates/college_public.pem"),
      "utf8"
    ),
  };
} else {
  const keypair = forge.pki.rsa.generateKeyPair(2048);
  collegeKeyPair = {
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
  };
  fs.writeFileSync(
    path.join(__dirname, "../certificates/college_private.pem"),
    collegeKeyPair.privateKey
  );
  fs.writeFileSync(
    path.join(__dirname, "../certificates/college_public.pem"),
    collegeKeyPair.publicKey
  );
}

module.exports = collegeKeyPair;
