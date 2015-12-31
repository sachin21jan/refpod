var ids = {
    facebook: {
        clientID: '546243712190153',
        clientSecret: 'e66e827a0f7db0ff43a446fa1aa449bc',
        callbackURL: 'http://localhost:3000/users/auth/facebook/callback'
    },
    twitter: {
        consumerKey: 'get_your_own',
        consumerSecret: 'get_your_own',
        callbackURL: "http://127.0.0.1:1337/auth/twitter/callback"
    },
    github: {
        clientID: 'get_your_own',
        clientSecret: 'get_your_own',
        callbackURL: "http://127.0.0.1:1337/auth/github/callback"
    },
    google: {
        clientID: '987282750488-6658fniofogmdgtm8dvkalq1inod4m67.apps.googleusercontent.com',
        clientSecret: 'q8I68eYrIE3JomPsXNDKKDeM',
        callbackURL: 'http://localhost:3000/users/auth/google/callback'
    }
};

module.exports = ids;