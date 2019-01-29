const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, emailTemplate } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');


const cookieSettings = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365,
}

// Pulling Data
const Mutations = {
  async createItem(parent, args, ctx, info) {
    // Check if user is logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to create a sell item!')
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        // This is how a relationship is created between Item and User
        user: {
          connect: {
            id: ctx.request.userId
          }
        },
        ...args,
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
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
    // TODO: check if they own that item, or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions
      .some(permission => ['ADMIN', 'ITEMDELETE']
        .includes(permission));

    if (!ownsItem && hasPermissions) {
      throw new Error('You don\'t have permission!')
    };

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
  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId)
      throw new Error('You must be logged in!')
    // 2. Query the current user
    const currentUser = ctx.request.user;

    // 3. Check if the has permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
    // 4. Update the permissions coming in via "args" of updatePermissions
    // "set" is part of the Prisma syntax and must be used
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          set: args.permissions,
        },
      },
      where: {
        id: args.userId,
      },
    }, info)
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You are not signed in!');
    };
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems(
      {
        where: {
          user: { id: userId },
          item: { id: args.id }
        }
      });
    // 3. Check if the item is already in their cart, and increment by +1 if it is
    if (existingCartItem) {
      console.log('Item already in cart')
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info);
    };
    // 4. If its not, create a fresh cartItem for user
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      },
    }, info);
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id
      },
    }, `{ id, user { id } }`);
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No item found to remove!');
    // 2. Make sure they own the cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('You do not own this item!')
    }
    // 3. Delete the item from cart
    return ctx.db.mutation.deleteCartItem({
      where: {
        id: args.id,
      },
    }, info);
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current User and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) throw new Error('You must be signed in to complete this order.');
    const user = await ctx.db.query.user(
      {
        where: {
          id: userId
        }
      },
      `{
       id 
       name 
       email 
       cart {
         id
         quantity
         item {
           title
           price
           id
           description
           image
           largeImage
         }
       }}`
    );
    // 2. Re-calculate the total for the price
    const amount = user.cart.reduce((tally, cartItem) =>
      tally + cartItem.item.price * cartItem.quantity, 0
    );
    console.log(`Going to charge for a total of ${amount}`);
    // 3. Create the stripe charge(turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    // 4. Convert the CartItems to OrderItems
    // Make an array of orderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. Create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });
    // 6. Clean up - clear the User's cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      }
    });
    // 7. Return the order to the client
    return order;
  },
};

module.exports = Mutations;
