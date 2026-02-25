const GitHubStrategy = require('passport-github2').Strategy;
const db = require('../db');

module.exports = function setupPassport(passport) {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, rows[0] || null);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email', 'repo'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const { rows } = await db.query(
            `INSERT INTO users (github_id, github_login, github_name, github_avatar_url, github_email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (github_id) DO UPDATE SET
               github_login = EXCLUDED.github_login,
               github_name = EXCLUDED.github_name,
               github_avatar_url = EXCLUDED.github_avatar_url,
               github_email = EXCLUDED.github_email
             RETURNING *`,
            [
              profile.id,
              profile.username,
              profile.displayName || profile.username,
              profile.photos?.[0]?.value,
              email,
            ]
          );
          done(null, rows[0]);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};
