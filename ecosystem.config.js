module.exports = {
  apps : [{
    name: 'update-blue',
    script: 'update-blue.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'dkz',
      host : 'ultimheat.com',
      ref  : 'origin/master',
      repo : 'https://github.com/blueink-bkk/224-blue-update.git',
      path : '/home/dkz/224-blue-update',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
