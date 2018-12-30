const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transport, emailTemplate } = require('../mail');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const cookieSettings = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365,
}

// Pulling Data
const Mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      },
    }, info);
    return item;
  },
  async updateItem(parent, args, ctx, info) {
    // first take a copy of the updates
    const update = await { ...args };
    // remove the ID from the updates
    delete update.id;
    // run the update method
    return ctx.db.mutation.updateItem({
      data: update,
      where: {
        id: args.id,
      },
    }, info)
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // Find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // TODO: check if they own that item, or have the permissions

    // Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },


  async signup(parent, args, ctx, info) {
    // toLowerCase to ensure that the email works
    args.email = args.email.toLowerCase();
    // Hash the user's pw
    const password = await bcrypt.hash(args.password, 10)
    // Create the user in the db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, cookieSettings);
    return user;
  },
  // args is destructured as { email, password }
  // rather than typing args.email args.password
  async signin(parent, { email, password }, ctx, info) {
    // 1. Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their PW is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. Generate JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, cookieSettings);
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Successfully signed out!' }
  },

  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromisifed = promisify(randomBytes);
    const resetToken = (await randomBytesPromisifed(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hr from now
    const response = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // 3. Email the reset token!
    const mailRes = await transport.sendMail({
      from: 'gabrielladiv@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: emailTemplate(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}
      ">Click Here to Reset</a>`),
    });

    // 4. Return the message
    return { message: 'BYYYYEEE' };
  },
  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error('Unmatched Passwords!')
    };
    // 2. Check if it's a legit reset token
    // 3. Check if it's expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error('This token is either valid or expired!')
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id },
      process.env.APP_SECRET);
    // 7. Set JWT cookie
    ctx.response.cookie('token', token, cookieSettings);
    // 8. Return the new user
    return updatedUser;
  },

};

module.exports = Mutations;
