const got = require('got');

module.exports = async function (reqURL) {
  try {
    const response = await got(reqURL, {
      strictSSL: false,
      rejectUnauthorized: false,
    });
    //console.log(response.request.gotOptions);//请求头
    return response.body.toString()
  } catch (error) {
    console.log(error);
    throw new Error(error)
  }
}