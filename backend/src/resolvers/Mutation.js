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
    // Create JWT token
    // APP_SECRET comes from the variables.env file
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1yr long cookie
    });
    // Finallyyyy we return the user to the browser
    return user;
  },
};

module.exports = Mutations;
