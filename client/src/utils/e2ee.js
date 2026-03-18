const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

const generateId = () => crypto.randomUUID();

export const getStoredKeyPair = async (userId) => {
  const keyName = `e2ee-private-${userId}`;
  const stored = localStorage.getItem(keyName);

  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed;
  }

  const encryptionKey = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedPublic = await crypto.subtle.exportKey(
    "spki",
    encryptionKey.publicKey,
  );
  const exportedPrivate = await crypto.subtle.exportKey(
    "pkcs8",
    encryptionKey.privateKey,
  );

  const keyPair = {
    publicKey: toBase64(new Uint8Array(exportedPublic)),
    privateKey: toBase64(new Uint8Array(exportedPrivate)),
    fingerprint: generateId(),
  };

  localStorage.setItem(keyName, JSON.stringify(keyPair));
  return keyPair;
};

const importPublicKey = async (base64) => {
  const raw = fromBase64(base64);
  return crypto.subtle.importKey(
    "spki",
    raw,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
};

const importPrivateKey = async (base64) => {
  const raw = fromBase64(base64);
  return crypto.subtle.importKey(
    "pkcs8",
    raw,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  );
};

export const encryptPayloadForParticipants = async (payload, participants) => {
  const data = encoder.encode(JSON.stringify(payload));
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    data,
  );

  const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);

  const encryptedKeys = await Promise.all(
    participants
      .filter((p) => p?.publicKey)
      .map(async (participant) => {
        const key = await importPublicKey(participant.publicKey);
        const encryptedKey = await crypto.subtle.encrypt(
          { name: "RSA-OAEP" },
          key,
          exportedAesKey,
        );
        return {
          user: participant.id || participant._id,
          encryptedKey: toBase64(new Uint8Array(encryptedKey)),
        };
      }),
  );

  return {
    ciphertext: toBase64(new Uint8Array(encrypted)),
    nonce: toBase64(iv),
    encryptedKeys,
  };
};

export const decryptMessage = async (message, selfUserId, privateKeyBase64) => {
  if (
    !message?.ciphertext ||
    !message?.nonce ||
    !message?.encryptedKeys?.length
  ) {
    return null;
  }

  const recipientKey = message.encryptedKeys.find(
    (entry) => String(entry.user) === String(selfUserId),
  );

  if (!recipientKey) {
    return null;
  }

  const privateKey = await importPrivateKey(privateKeyBase64);
  const decryptedAesKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    fromBase64(recipientKey.encryptedKey),
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    decryptedAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(message.nonce) },
    aesKey,
    fromBase64(message.ciphertext),
  );

  return JSON.parse(decoder.decode(plaintext));
};

export const decryptFileBytes = async (encryptedBuffer, ivBase64, rawKeyBase64) => {
  const aesKey = await crypto.subtle.importKey(
    "raw",
    fromBase64(rawKeyBase64),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivBase64) },
    aesKey,
    encryptedBuffer,
  );

  return decrypted;
};

export const encryptFileBytes = async (arrayBuffer) => {
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    arrayBuffer,
  );

  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  return {
    encryptedBuffer: encrypted,
    iv,
    rawKey,
  };
};

export const exportHelpers = { toBase64, fromBase64 };
