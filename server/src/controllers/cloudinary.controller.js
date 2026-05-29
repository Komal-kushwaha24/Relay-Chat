import crypto from 'crypto';

const CLOUDINARY_FOLDER = 'relaychat';

const buildSignature = (paramsToSign, apiSecret) => {
  const sortedKeys = Object.keys(paramsToSign).sort();
  const signString = sortedKeys
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(signString + apiSecret).digest('hex');
};

export const getSignature = (req, res) => {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({
      success: false,
      message: 'Cloudinary environment variables are not configured',
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: CLOUDINARY_FOLDER,
    timestamp,
  };
  const signature = buildSignature(paramsToSign, CLOUDINARY_API_SECRET);

  res.status(200).json({
    success: true,
    data: {
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME,
      folder: CLOUDINARY_FOLDER,
      signature,
      timestamp,
    },
  });
};
