const bcyrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    const password = await bcyrpt.hash(args.password, 10)
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
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
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
    const valid = await bcyrpt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. Generate JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    return user;
  },
};

module.exports = Mutations;
