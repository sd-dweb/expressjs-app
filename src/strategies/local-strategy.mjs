import passport from 'passport';
import { Strategy } from 'passport-local';
import { mockUsers } from '../mocks/mock-users.mjs';

// Configure the local strategy with usernameField option
export default passport.use(
    new Strategy(
        { usernameField: 'name' },  // Map 'name' field to username
        (name, password, done) => {
            console.log('Username: ', name, 'Password: ', password);

            const findUser = mockUsers.find((user) => user.name === name);
            if (!findUser || findUser.password !== password) {
                return done(null, false, { message: 'Bad credentials' });
            }
            return done(null, findUser);
        }
    )
);

// Serialize user to session
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    console.log('Deserializing user:', id);
    const findUser = mockUsers.find((user) => user.id === id);
    if (!findUser) {
        return done(new Error('User not found'), null);
    }
    console.log('Deserializing user:', findUser);
    done(null, findUser);
});
