const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

function getVNPayInstance() {
  return new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_SECURE_SECRET,
    vnpayHost: process.env.VNPAY_HOST,
    testMode: true,
    hashAlgorithm: "SHA512",
    loggerFn: ignoreLogger,
  });
}

function generatePayID(prefix = "PAY") {
  const now = new Date();
  return `${prefix}${now.getTime()}${now.getMilliseconds()}`;
}

function createVNPayUrl({
  amount,
  ipAddr,
  txnRef,
  orderInfo,
  returnUrl = process.env.VNPAY_RETURN_URL,
}) {
  const vnpay = getVNPayInstance();

  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1);

  return vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: returnUrl,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
    vnp_ExpireDate: dateFormat(expireDate),
  });
}

function verifyVNPayReturn(query) {
  const vnpay = getVNPayInstance();
  return vnpay.verifyReturnUrl(query);
}

module.exports = {
  createVNPayUrl,
  verifyVNPayReturn,
  generatePayID,
};