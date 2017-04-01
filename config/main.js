module.exports = {
  'secret': 'minsuperhemligasecret',

   'facebookAuth' : {
        'clientID'      : '1094802380629107', // your App ID
        'clientSecret'  : 'de8a90418afb60688388cf1f16b634f6', // your App Secret
        'callbackURL'   : 'http://localhost:3000/users/auth/facebook/callback',
		'profileFields' : ['id', 'displayName', 'emails', 'first_name', 'last_name']
    }
};

