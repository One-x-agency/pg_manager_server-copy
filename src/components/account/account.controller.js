const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const Service = require('./account.service');
const TokenService = require('../token/token.service');
const Vars = require('../../config/var');
const Mail = require('../../service/mail');
const ServerError = require('../../utility/serverError');
// const EmailVerifyOtpTemplate = require('../../utility/emailTemplates/emailVerifyOtp');
const ForgotPasswordTemplate = require('../../utility/emailTemplates/forgotPassword');
const User = require('../user/user.class');
const Constants = require('../../config/constant');
const CallDal = require('../../utility/callDal');
const AccountDal = require('./account.dal');
const JwtToken = require('../../utility/jwtToken');

// #region VerifyEmail
exports.verifyEmail = async (req, res, next) => {
  const { body } = req;
  try {
    const account = await Service.findWithEmailAndPhone(body.email, body.phone);
    if (account) throw new ServerError('DUPLICATE_KEY_VALUE', 'Account with this Email or Phone already exists');

    const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 10);

    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = 123456;
    const token = jwt.sign({ type: 'emailVerify', email: body.email }, Vars.jwtSecret, { expiresIn: '10m' });

    await TokenService.insertOne({ token, expireAt: expiryDate.toISOString(), otp });

    // Mail.send(body.email, 'OTP for verification', EmailVerifyOtpTemplate(otp));

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region Register
/**
 * Register new account
 * - If account not exists or not verified, then create new account and send OTP
 *
 */
exports.register = async (req, res, next) => {
  try {
    const Token = await TokenService.findByToken(req.body.token);
    if (!Token) throw new ServerError('NOT_FOUND', 'Token is either expired or invalid');

    const verifyTokenPayload = JwtToken.decode(req.body.token);
    if (!verifyTokenPayload) throw new ServerError('UNAUTHORIZED', 'Invalid token');

    const isOtpValid = await bcrypt.compare(req.body.otp.toString(), Token.otp);
    if (!isOtpValid) throw new ServerError('INVALID_DATA', 'Invalid OTP');

    const account = await Service.createAccount({
      name: req.body.name,
      email: verifyTokenPayload.email,
      phone: req.body.phone,
      password: req.body.password,
      isEmailVerified: true,
    });

    const userTokenPayload = {
      accountId: account.id,
      id: account.user.id,
      isRootUser: true,
    };
    const user = new User(userTokenPayload);

    const userToken = user.generateToken();

    res.cookie('token', userToken, { maxAge: Constants.user.token.expiryInSeconds * 1000, httpOnly: true });

    const apiResponse = {
      token: userToken,
      user: { ...userTokenPayload, username: account.name, accountNumber: account.accountNumber },
      expiryInSeconds: Constants.user.token.expiryInSeconds,
    };

    res.status(200).json(apiResponse);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region Login
exports.login = async (req, res, next) => {
  try {
    const account = await Service.validateAccount(req.body.emailOrPhone, req.body.password);

    let { expiryInSeconds } = Constants.user.token;
    if (req.body.longLived) expiryInSeconds = 3600 * 24 * 30;

    const tokenPayload = {
      accountId: account.id,
      id: account.user.id,
      isRootUser: account.user.isRootUser,
    };

    const user = new User(tokenPayload);
    const userToken = user.generateToken({ expiryInSeconds });

    res.cookie('token', userToken, { maxAge: expiryInSeconds * 1000, httpOnly: true });

    const apiResponse = {
      token: userToken,
      user: {
        ...tokenPayload,
        username: account.name,
        email: account.email,
        accountNumber: account.accountNumber,
      },
      expiryInSeconds: Constants.user.token.expiryInSeconds,
    };

    res.status(200).json(apiResponse);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region Logout
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region ChangePassword
exports.changePassword = async (req, res, next) => {
  try {
    const account = await Service.findById(req.user.accountId);
    if (!account) throw new ServerError('NOT_FOUND', 'Account not found');

    const isPasswordValid = await bcrypt.compare(req.body.password, account.password);
    if (!isPasswordValid) throw new ServerError('INVALID_DATA', 'Old password is incorrect');

    await Service.update(account.id, { password: req.body.newPassword });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region forgotPassword
exports.forgotPassword = async (req, res, next) => {
  try {
    const account = await Service.findByEmailOrPhone(req.body.emailOrPhone);
    if (!account) throw new ServerError('NOT_FOUND', 'Account not found');

    const tokenPayload = {
      type: 'forgotPassword',
      accountId: account.id,
    };

    const token = jwt.sign(tokenPayload, Vars.jwtSecret, { expiresIn: '10m' });
    const url = `${req.body.redirectUrl}?token=${token}`;

    Mail.send(account.email, 'reset password', ForgotPasswordTemplate(url));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region resetPassword
exports.resetPassword = async (req, res, next) => {
  try {
    const tokenPayload = JwtToken.decode(req.body.token);

    if (!tokenPayload || tokenPayload.type !== 'forgotPassword') throw new ServerError('INVALID_DATA', 'Invalid token');

    const account = await Service.findById(tokenPayload.accountId);
    if (!account) throw new ServerError('NOT_FOUND', 'Account not found');

    await Service.update(account.id, { password: req.body.password });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region findById
exports.getAccount = async (req, res, next) => {
  try {
    const account = await Service.findById(req.user.accountId);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

// #region deleteAccount
exports.deleteAccount = async (req, res, next) => {
  const { accountId } = req.user;
  const { password } = req.body;
  try {
    await Service.deleteAccount(accountId, password);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region login with google
exports.loginWithGoogle = async (req, res, next) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = response.data;

    const account = await CallDal(AccountDal.findByEmailOrPhone, user.email);

    if (account) {
      const rootUser = await CallDal(AccountDal.getRootUserByAccountId, account.id);

      const tokenPayload = {
        accountId: account.id,
        id: rootUser.id,
        isRootUser: true,
      };

      const userToken = new User(tokenPayload).generateToken();

      const apiResponse = {
        tokenType: 'user_access_token',
        token: userToken,
        user: {
          ...tokenPayload,
          username: account.name,
          email: account.email,
        },
        expiryInSeconds: Constants.user.token.expiryInSeconds,
      };

      res.cookie('token', userToken, { maxAge: Constants.user.token.expiryInSeconds * 1000, httpOnly: true });
      res.status(200).json(apiResponse);
    } else {
      const tokenPayload = {
        type: 'update_account_profile',
        name: user.name,
        email: user.email,
      };

      const token = JwtToken.encode(tokenPayload, { expiresIn: '10m' });

      res.status(200).json({ token, tokenType: 'update_account_profile' });
    }
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region complete account registration
exports.completeAccountRegistration = async (req, res, next) => {
  const { token, phone } = req.body;

  try {
    const tokenPayload = JwtToken.decode(token);
    if (!tokenPayload || tokenPayload.type !== 'update_account_profile') throw new ServerError('INVALID_DATA', 'Invalid token');

    const account = await Service.createAccount({
      name: tokenPayload.name,
      email: tokenPayload.email,
      phone,
      password: null,
      isEmailVerified: true,
    });

    const userTokenPayload = {
      accountId: account.id,
      id: account.user.id,
      isRootUser: true,
    };

    const user = new User(userTokenPayload);
    const userToken = user.generateToken();

    const apiResponse = {
      token: userToken,
      user: { ...userTokenPayload, username: account.name },
      expiryInSeconds: Constants.user.token.expiryInSeconds,
    };

    res.cookie('token', userToken, { maxAge: Constants.user.token.expiryInSeconds * 1000, httpOnly: true });
    res.status(200).json(apiResponse);
  } catch (error) {
    next(error);
  }
};
// #endregion
