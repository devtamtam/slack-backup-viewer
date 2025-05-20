const path = require('path');

module.exports = function(app) {
  // Serve files from the slack_files directory
  app.use('/slack_files_202505200014', (req, res, next) => {
    const options = {
      root: path.join(__dirname, '../../slack_files_202505200014'),
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };
    
    const fileName = req.path.substring(1); // Remove leading slash
    res.sendFile(fileName, options, (err) => {
      if (err) {
        next(err);
      }
    });
  });
};