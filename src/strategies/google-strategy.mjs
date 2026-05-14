import passport from 'passport';
import 'dotenv/config';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GoogleUser } from '../schemas/google-user.mjs';

export default passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URL,
  scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {

  let findUser;

  try {
    findUser = await GoogleUser.findOne({ id: profile.id });
  } catch (err) {
    return done(err, null);
  }

  try {
    if (!findUser) {
      const newUser = new GoogleUser({
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      });
      await newUser.save();
      return done(null, newUser);
    }

    return done(null, findUser);
  } catch (err) {
    console.log(err);
    return done(err, null);
  }
}));

// Serialize user to session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  const findUser = await GoogleUser.findOne({ id: id });
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