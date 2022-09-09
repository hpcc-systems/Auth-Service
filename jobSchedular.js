const schedule = require("node-schedule");
let models = require("./models");
let User = models.User;

// This cron job runs every hour and removes all un verified users that are 12 hours old or more

const userAccountCleanUp = () =>
  schedule.scheduleJob("0 0  */1 * * *", async function () {
    try {
      const users = await User.findAll({ where: { accountVerified: false } });

      const currentTimeStamp = Date.now();
      const unverifiedUserIds = [];
      users.map((user) => {
        const createdAt = user.createdAt;
        const createdAtTimeStamp = Date.parse(createdAt);
        const accountAge = Math.round((currentTimeStamp - createdAtTimeStamp) / (1000 * 60 * 60)); // hrs
        if (accountAge > 12 && !user.accountVerified) {
          unverifiedUserIds.push(user.id);
        }
      });
      await User.destroy({ where: { id: unverifiedUserIds } });
      console.log("------------------------------------------");
      console.log(`User table cleanup - ${unverifiedUserIds.length} un-verified accounts removed`);
      console.log("------------------------------------------");
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {
    userAccountCleanUp
}