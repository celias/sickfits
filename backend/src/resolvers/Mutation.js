// Pulling Data
const Mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      },
    }, info);

    console.log(item)
    return item;
  },
  async updateItem(parent, args, ctx, info) {
    // first take a copy of the updates
    const update = { ...args };
    // remove the ID from the updates
    delete update.id;
    // run the update method
    return ctx.db.mutation.updateItem({
      data: update,
      where: {
        id: args.id,
      },
    }, info)
  }
};

module.exports = Mutations;
