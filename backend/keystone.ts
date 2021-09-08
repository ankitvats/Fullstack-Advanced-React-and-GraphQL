// Importing .env file
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import 'dotenv/config';
import { insertSeedData } from './seed-data';

// Defining Database URL - getting from .env file
const databaseURL =
  process.env.DATABASE_URL || 'mondodb://localhost/keystone-sick-fits';

// Defining Session for keystone
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // how long they stay signed in?
  secret: process.env.COOKIE_SECRET,
};

// Auth
const { withAuth } = createAuth({
  listKey: 'User', // who is responsible for auth
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // todo: add intial roles here
  },
});

// keystone configuration
// wrap the config object with withAuth
export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose', // for mongodb
      url: databaseURL,
      // importing dummy data from json file
      async onConnect(keystone) {
        console.log('Connected to the database!');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    // lists: lists are data types
    lists: createSchema({
      User,
      Product,
      ProductImage,
    }),
    // ui: show the keystone ui to users who is logged in
    ui: {
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL Query
      user: 'id',
    }),
  })
);
