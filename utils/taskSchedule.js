var cron = require('node-cron');
const Story = require('../models/storyModel');
const { unlink, unlinkSync } = require('fs');

module.exports = function () {
  cron.schedule('*/1 * * * * *', async () => {
    const allStoryWhichAlreadyExpired = await Story.find({
      expiresAt: { $lt: Date.now() + 1000 },
    });
    for (var i = 0; i < allStoryWhichAlreadyExpired.length; i++) {
      const docToBeDeleted = allStoryWhichAlreadyExpired[i];
      unlink(
        `${__dirname}/../public/story/${docToBeDeleted.storyPhoto}`,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
      await Story.findByIdAndDelete(docToBeDeleted.id);
      console.log('deleted: ', docToBeDeleted);
    }
  });
};
