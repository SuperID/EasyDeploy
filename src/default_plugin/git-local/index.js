/**
 * EasyDeploy Plugin: git-local
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */


module.exports = function (plugin) {

  plugin.data.register('git_repository_list', function (params, callback) {
    console.log('called');
    callback(null, [
      {name: 'SIDServer', url: 'ssh://git@git.isncer.com:2345/superid/sidserver.git', $plugin: 'git-local'},
      {name: 'FaceCloud', url: 'ssh://git@git.isncer.com:2345/superid/facecloud.git', $plugin: 'git-local'},
    ]);
  });

  plugin.data.register('git_repository_commit_list', function (params, callback) {
    callback(null, [
      {
        id: 'aaaaaaaa',
        committer: {name: 'Lei', email: 'lei@www.com'},
        committed_date: new Date(),
        message: 'aaa\nbbb',
        short_message: 'aaa'
      },
      {
        id: 'aaaaaaaa',
        committer: {name: 'Lei', email: 'lei@www.com'},
        committed_date: new Date(),
        message: 'aaa\nbbb',
        short_message: 'aaa'
      }
    ]);
  });

  plugin.data.register('git_repository_branch_list', function (params, callback) {
    callback(null, [
      {name: 'master'},
      {name: 'lei_dev'}
    ]);
  });

};
