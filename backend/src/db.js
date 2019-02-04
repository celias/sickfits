// This file connects to the remote prisma DB and gives us the
// ability to query it with JS
const { Prisma } = require('prisma-binding');

const db = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'https://sickfits-production-195205efb1.herokuapp.com/sickfits-prod/prod',
  secret: process.env.PRISMA_SECRET,
  debug: false,
});

module.exports = db;