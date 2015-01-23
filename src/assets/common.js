;(function () {

  // AJAX Status
  function ajaxLoading () {
    $('.ajax-loader').show();
  }
  function ajaxDone () {
    $('.ajax-loader').hide();
  }
  $(document).ajaxStart(ajaxLoading)
             .ajaxStop(ajaxDone)
             .ajaxError(ajaxDone);
  $(document.body).append('<div class="ajax-loader"><img src="/assets/img/ajax-loader.gif"></div>');

  // AJAX Request
  function makeAjaxRequest (method, url, params, callback) {
    if (method === 'del') method = 'delete';
    $.ajax({
      type:     method,
      url:      url,
      data:     params,
      dataType: 'json',
      success: function (data) {
        if (data.status != 200) return callback(data.message, data);
        callback(null, data.data, data);
      },
      error:  function (req, status, err) {
        callback(status + ' ' + err);
      }
    });
  }
  var ajaxRequest = window.ajaxRequest = {};
  ['get', 'post', 'put', 'delete', 'del', 'head', 'trace', 'option'].forEach(function (method) {
    ajaxRequest[method] = function (url, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = {};
      }
      return makeAjaxRequest(method, url, params, callback);
    };
  });

  var messageBox = window.messageBox = {};
  ['warning', 'error', 'success', 'info'].forEach(function (type) {
    messageBox[type] = function (options, callback) {
      if (typeof options === 'string') {
        options = {
          title: options
        };
      }
      options.type = type;
      return swal(options, callback);
    };
  });

})();
