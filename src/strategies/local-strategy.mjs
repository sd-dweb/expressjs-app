import passport from 'passport';
import { Strategy } from 'passport-local';
import { User } from '../schemas/user.mjs';
import { comparePassword } from '../utils/helper.mjs';

// Configure the local strategy with usernameField option
export default passport.use(
  new Strategy(
    { usernameField: 'name' },  // Map 'name' field to username
    async (name, password, done) => {
      try {
        const findUser = await User.findOne({ name });

        if (!findUser || !comparePassword(password, findUser.password)) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, findUser);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Serialize user to session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  const findUser = await User.findById(id);
  console.log('Deserializing user:', findUser);
  try {
    if (!findUser) {
      new Error('User not found');
    }
    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});
