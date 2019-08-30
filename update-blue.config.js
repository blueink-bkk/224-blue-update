module.exports = {
  apps : [{
    name        : "update-blue",
    script      : "update-blue.js",
    watch       : ['./'],
    watch_delay: 500,
    ignore_watch : ["node_modules", "224-blueink-app"],
    watch_options: {
      "followSymlinks": false
    },
    merge_logs  : true,
//    cwd         : "/var/www/parse-apps/app1/",
  }]
}
