/** PM2 ecosystem - usar na EC2: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'meca-admin',
      cwd: '/home/ec2-user/meca-new/meca-admin-nextjs',
      script: 'node_modules/.bin/next',
      args: 'start -p 9100',
      interpreter: 'none',
      env: { NODE_ENV: 'production' },
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
    },
  ],
};
